"use client";

import React from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';

interface TextToSpeechButtonProps {
    text: string;
    className?: string;
    variant?: 'icon' | 'button';
}

export function TextToSpeechButton({
    text,
    className = "",
    variant = 'icon'
}: TextToSpeechButtonProps) {
    const { speak, stop, pause, resume, isSpeaking, isPaused, isSupported } = useTextToSpeech();

    const handleClick = () => {
        if (!text) return;

        if (isSpeaking && !isPaused) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            speak(text);
        }
    };

    const handleStop = (e: React.MouseEvent) => {
        e.stopPropagation();
        stop();
    };

    if (!isSupported) {
        return null;
    }

    if (variant === 'button') {
        return (
            <div className={`flex gap-2 ${className}`}>
                <button
                    onClick={handleClick}
                    className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                    disabled={!text}
                    aria-label={isSpeaking ? (isPaused ? 'Resume reading' : 'Pause reading') : 'Read aloud'}
                >
                    {isSpeaking && !isPaused ? (
                        <>
                            <Pause size={18} />
                            <span>Pause</span>
                        </>
                    ) : isPaused ? (
                        <>
                            <Play size={18} />
                            <span>Resume</span>
                        </>
                    ) : (
                        <>
                            <Volume2 size={18} />
                            <span>Read Aloud</span>
                        </>
                    )}
                </button>
                {isSpeaking && (
                    <button
                        onClick={handleStop}
                        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
                        aria-label="Stop reading"
                    >
                        <VolumeX size={18} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`rounded-full p-2 transition-all ${isSpeaking
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${className}`}
            disabled={!text}
            aria-label={isSpeaking ? (isPaused ? 'Resume reading' : 'Pause reading') : 'Read aloud'}
            title="Read aloud"
        >
            {isSpeaking && !isPaused ? (
                <Pause size={20} />
            ) : isPaused ? (
                <Play size={20} />
            ) : (
                <Volume2 size={20} />
            )}
        </button>
    );
}
