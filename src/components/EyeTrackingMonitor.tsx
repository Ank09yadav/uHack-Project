"use client";

import { useState, useEffect, useRef } from 'react';
import { Eye, Pause, Play, Coffee, AlertCircle } from 'lucide-react';
import { eyeTrackingService, AttentionMetrics } from '@/lib/services/eyeTrackingService';

interface EyeTrackingMonitorProps {
    userId: string;
    onSuggestBreak?: () => void;
    onFocusLost?: () => void;
}

export default function EyeTrackingMonitor({ userId, onSuggestBreak, onFocusLost }: EyeTrackingMonitorProps) {
    const [isTracking, setIsTracking] = useState(false);
    const [metrics, setMetrics] = useState<AttentionMetrics | null>(null);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [shouldPause, setShouldPause] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Initialize eye tracking
        eyeTrackingService.initialize();

        return () => {
            eyeTrackingService.cleanup();
        };
    }, []);

    useEffect(() => {
        if (!isTracking) return;

        const interval = setInterval(() => {
            // Get current metrics
            const currentMetrics = eyeTrackingService.getCurrentMetrics();
            if (currentMetrics) {
                setMetrics(currentMetrics);

                // Check for suggestions
                const currentSuggestion = eyeTrackingService.getSuggestion();
                if (currentSuggestion) {
                    setSuggestion(currentSuggestion);
                }

                // Check if should pause
                const pause = eyeTrackingService.shouldPauseLesson();
                if (pause && !shouldPause) {
                    setShouldPause(true);
                    onFocusLost?.();
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isTracking, shouldPause, onFocusLost]);

    const startTracking = async () => {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            eyeTrackingService.startTracking(userId);
            setIsTracking(true);
            setShouldPause(false);
        } catch (error) {
            console.error('Failed to start eye tracking:', error);
            alert('Camera access is required for attention monitoring');
        }
    };

    const stopTracking = () => {
        const session = eyeTrackingService.stopTracking();
        if (session) {
            const report = eyeTrackingService.generateReport(session);
            console.log('Attention Report:', report);
        }

        // Stop camera
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        setIsTracking(false);
        setMetrics(null);
        setSuggestion(null);
    };

    const dismissSuggestion = () => {
        setSuggestion(null);
        setShouldPause(false);
    };

    const takeBreak = () => {
        setSuggestion(null);
        setShouldPause(false);
        onSuggestBreak?.();
    };

    return (
        <div className="space-y-4">
            {/* Hidden video element for camera feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
            />

            {/* Tracking Control */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                    <Eye className={`w-6 h-6 ${isTracking ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
                    <div>
                        <h3 className="font-semibold text-gray-900">Attention Monitoring</h3>
                        <p className="text-sm text-gray-600">
                            {isTracking ? 'Tracking your focus in real-time' : 'Start to monitor attention'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={isTracking ? stopTracking : startTracking}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${isTracking
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isTracking ? (
                        <>
                            <Pause className="w-4 h-4" />
                            Stop
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Start
                        </>
                    )}
                </button>
            </div>

            {/* Suggestion Alert */}
            {suggestion && (
                <div className={`p-4 rounded-lg border-l-4 ${shouldPause
                        ? 'bg-red-50 border-red-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            {shouldPause ? (
                                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                            ) : (
                                <Coffee className="w-6 h-6 text-blue-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={`font-medium ${shouldPause ? 'text-red-900' : 'text-blue-900'}`}>
                                    {suggestion}
                                </p>
                                {shouldPause && (
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={takeBreak}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                                        >
                                            Take a Break
                                        </button>
                                        <button
                                            onClick={dismissSuggestion}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
                                        >
                                            Continue Learning
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!shouldPause && (
                            <button
                                onClick={dismissSuggestion}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Metrics Display */}
            {metrics && isTracking && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                        label="Focus Score"
                        value={Math.round(metrics.focusScore * 100)}
                        unit="%"
                        icon="🎯"
                        color={metrics.focusScore > 0.7 ? 'green' : metrics.focusScore > 0.4 ? 'yellow' : 'red'}
                    />
                    <MetricCard
                        label="Engagement"
                        value={metrics.engagementLevel}
                        icon="⚡"
                        color={
                            metrics.engagementLevel === 'high' ? 'green' :
                                metrics.engagementLevel === 'medium' ? 'yellow' : 'red'
                        }
                    />
                    <MetricCard
                        label="Distractions"
                        value={metrics.distractionCount}
                        icon="👀"
                        color={metrics.distractionCount < 3 ? 'green' : metrics.distractionCount < 6 ? 'yellow' : 'red'}
                    />
                    <MetricCard
                        label="Blink Rate"
                        value={Math.round(metrics.blinkRate)}
                        unit="/min"
                        icon="👁️"
                        color={metrics.blinkRate < 20 ? 'green' : metrics.blinkRate < 25 ? 'yellow' : 'red'}
                    />
                </div>
            )}

            {/* Focus Visualization */}
            {metrics && isTracking && (
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Focus Trend</h4>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${metrics.focusScore > 0.7 ? 'bg-green-500' :
                                    metrics.focusScore > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${metrics.focusScore * 100}%` }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <span>Low Focus</span>
                        <span>High Focus</span>
                    </div>
                </div>
            )}
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: number | string;
    unit?: string;
    icon: string;
    color: 'green' | 'yellow' | 'red';
}

function MetricCard({ label, value, unit, icon, color }: MetricCardProps) {
    const colorClasses = {
        green: 'text-green-600 bg-green-50 border-green-200',
        yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        red: 'text-red-600 bg-red-50 border-red-200'
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-2xl font-bold">
                    {value}{unit}
                </span>
            </div>
            <p className="text-sm font-medium">{label}</p>
        </div>
    );
}
