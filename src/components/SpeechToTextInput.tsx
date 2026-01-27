"use client";

import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechToText } from '@/lib/hooks/useSpeechToText';

interface SpeechToTextInputProps {
    onTranscriptChange?: (transcript: string) => void;
    placeholder?: string;
    className?: string;
}

import { WhisperRecorder } from './WhisperRecorder';

export function SpeechToTextInput({
    onTranscriptChange,
    placeholder = "Click the microphone to start speaking...",
    className = ""
}: SpeechToTextInputProps) {
    const {
        transcript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    } = useSpeechToText({ continuous: true, interimResults: true });

    const [mode, setMode] = React.useState<'basic' | 'whisper'>('basic');
    const [whisperText, setWhisperText] = React.useState('');

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (onTranscriptChange) {
            if (mode === 'basic') {
                onTranscriptChange(transcript);
            } else if (mode === 'whisper') {
                // only sync if whisperText is not empty to avoid overwriting initial state if any?
                // But wait, if we switch modes, we might lose text.
                // Ideally user expects text to persist.
                // Current logic separates them. That is acceptable for "Modes".
                onTranscriptChange(whisperText);
            }
        }
    }, [transcript, whisperText, onTranscriptChange, mode]);

    const handleToggle = () => {
        setErrorMessage(null);
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    const handleWhisperComplete = (text: string) => {
        if (text.startsWith('Error:')) {
            setErrorMessage(text);
            return;
        }
        setErrorMessage(null);
        setWhisperText(prev => prev + ' ' + text);
        // We defer onTranscriptChange sync to the useEffect hook when mode is 'whisper'
    };

    if (!isSupported && mode === 'basic') {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                Speech recognition is not supported in your browser. Please use Chrome or Edge.
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex justify-end gap-2 mb-2">
                <button
                    onClick={() => setMode('basic')}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${mode === 'basic' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    Fast (Web API)
                </button>
                <button
                    onClick={() => setMode('whisper')}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${mode === 'whisper' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    Powerful (Whisper AI)
                </button>
            </div>

            <div className="relative">
                <textarea
                    value={mode === 'basic' ? transcript : whisperText}
                    onChange={(e) => {
                        if (mode === 'basic') return; // Read-only for basic sync? No, allow edit.
                        const val = e.target.value;
                        if (mode === 'whisper') setWhisperText(val);
                        onTranscriptChange?.(val);
                    }}
                    placeholder={placeholder}
                    className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    aria-label="Speech to text input"
                />

                {mode === 'basic' ? (
                    <button
                        onClick={handleToggle}
                        className={`absolute right-3 top-3 rounded-full p-2 transition-all ${isListening
                            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        aria-label={isListening ? 'Stop recording' : 'Start recording'}
                        title={isListening ? 'Stop recording' : 'Start recording'}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                ) : (
                    <div className="absolute right-3 top-3">
                        <WhisperRecorder onTranscriptionComplete={handleWhisperComplete} />
                    </div>
                )}
            </div>

            {mode === 'basic' && isListening && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Listening...</span>
                </div>
            )}
            {mode === 'whisper' && (
                <div className="mt-1">
                    <p className="text-xs text-purple-600">
                        Powered by OpenAI Whisper (running locally). High accuracy, supports multiple languages.
                    </p>
                    {errorMessage && (
                        <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center justify-between">
                            <span>{errorMessage}</span>
                            <button onClick={() => setErrorMessage(null)} className="font-bold hover:underline">Dismiss</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
