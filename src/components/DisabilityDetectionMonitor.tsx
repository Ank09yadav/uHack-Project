"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { BehavioralMetrics, DetectionResult } from '@/lib/services/disabilityDetectionService';

interface DisabilityDetectionMonitorProps {
    userId: string;
    onDetection?: (result: DetectionResult) => void;
}

export default function DisabilityDetectionMonitor({ userId, onDetection }: DisabilityDetectionMonitorProps) {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [latestResult, setLatestResult] = useState<DetectionResult | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    // Simulate behavioral tracking
    useEffect(() => {
        if (!isMonitoring) return;

        const interval = setInterval(async () => {
            // In a real app, these would be collected from actual user interactions
            const metrics: BehavioralMetrics = {
                readingSpeed: 120 + Math.random() * 80,
                speechPauses: 5 + Math.random() * 10,
                gestureConfusion: Math.random(),
                answerAccuracy: 0.5 + Math.random() * 0.5,
                responseTime: 2000 + Math.random() * 3000,
                attentionSpan: 300 + Math.random() * 600,
                errorPatterns: []
            };

            try {
                const response = await fetch('/api/ai/detect-disability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, metrics })
                });

                if (response.ok) {
                    const data = await response.json();
                    setLatestResult(data.result);

                    if (data.result.detected && !showAlert) {
                        setShowAlert(true);
                        onDetection?.(data.result);
                    }
                }
            } catch (error) {
                console.error('Detection error:', error);
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [isMonitoring, userId, onDetection, showAlert]);

    const startMonitoring = () => {
        setIsMonitoring(true);
        setShowAlert(false);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
    };

    const dismissAlert = () => {
        setShowAlert(false);
    };

    return (
        <div className="space-y-4">
            {/* Monitoring Control */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                    <Brain className={`w-6 h-6 ${isMonitoring ? 'text-purple-600 animate-pulse' : 'text-gray-400'}`} />
                    <div>
                        <h3 className="font-semibold text-gray-900">AI Learning Analysis</h3>
                        <p className="text-sm text-gray-600">
                            {isMonitoring ? 'Actively monitoring learning patterns' : 'Monitoring paused'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={isMonitoring ? stopMonitoring : startMonitoring}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isMonitoring
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                >
                    {isMonitoring ? 'Stop' : 'Start'} Monitoring
                </button>
            </div>

            {/* Detection Alert */}
            {showAlert && latestResult?.detected && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-yellow-900 mb-2">
                                    ⚠️ Possible Learning Difficulty Detected
                                </h4>
                                <p className="text-sm text-yellow-800 mb-3">
                                    Our AI has identified patterns that may indicate a learning challenge.
                                    This is an early detection to help provide better support.
                                </p>

                                <div className="space-y-2 mb-3">
                                    <p className="text-sm font-medium text-yellow-900">Confidence: {Math.round(latestResult.confidence * 100)}%</p>
                                    <p className="text-sm font-medium text-yellow-900">Suggested Mode: {latestResult.adaptiveMode}</p>
                                </div>

                                <div className="bg-white p-3 rounded border border-yellow-200">
                                    <p className="text-sm font-medium text-gray-900 mb-2">Recommendations:</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        {latestResult.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="text-yellow-600">•</span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={dismissAlert}
                            className="text-yellow-600 hover:text-yellow-800"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Current Indicators */}
            {latestResult && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <IndicatorCard
                        label="Dyslexia"
                        value={latestResult.indicators.dyslexia}
                        icon="📖"
                    />
                    <IndicatorCard
                        label="ADHD"
                        value={latestResult.indicators.adhd}
                        icon="🎯"
                    />
                    <IndicatorCard
                        label="Speech Delay"
                        value={latestResult.indicators.speechDelay}
                        icon="💬"
                    />
                    <IndicatorCard
                        label="Hearing Issues"
                        value={latestResult.indicators.hearingIssues}
                        icon="👂"
                    />
                    <IndicatorCard
                        label="Visual Processing"
                        value={latestResult.indicators.visualProcessing}
                        icon="👁️"
                    />
                    <IndicatorCard
                        label="Overall"
                        value={latestResult.indicators.overall}
                        icon="🧠"
                        highlight
                    />
                </div>
            )}
        </div>
    );
}

interface IndicatorCardProps {
    label: string;
    value: number;
    icon: string;
    highlight?: boolean;
}

function IndicatorCard({ label, value, icon, highlight }: IndicatorCardProps) {
    const percentage = Math.round(value * 100);
    const getColor = () => {
        if (value < 0.3) return 'text-green-600 bg-green-50 border-green-200';
        if (value < 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className={`p-4 rounded-lg border ${highlight ? 'ring-2 ring-purple-500' : ''} ${getColor()}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-2xl font-bold">{percentage}%</span>
            </div>
            <p className="text-sm font-medium">{label}</p>
            <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                <div
                    className="h-full bg-current transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
