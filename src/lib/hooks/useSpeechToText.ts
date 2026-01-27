"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechToTextOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
}

interface UseSpeechToTextReturn {
    transcript: string;
    isListening: boolean;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSupported: boolean;
    error: string | null;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
    const {
        continuous = false,
        interimResults = true,
        lang = 'en-US',
    } = options;

    const [finalTranscript, setFinalTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const transcript = finalTranscript + interimTranscript;

    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check if browser supports Speech Recognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            setIsSupported(!!SpeechRecognition);

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = continuous;
                recognitionRef.current.interimResults = interimResults;
                recognitionRef.current.lang = lang;

                recognitionRef.current.onresult = (event: any) => {
                    let newFinal = '';
                    let newInterim = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcriptPiece = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            newFinal += transcriptPiece + ' ';
                        } else {
                            newInterim += transcriptPiece;
                        }
                    }

                    if (newFinal) {
                        setFinalTranscript(prev => prev + newFinal);
                    }
                    setInterimTranscript(newInterim);
                };

                recognitionRef.current.onerror = (event: any) => {
                    setError(event.error);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    setInterimTranscript(''); // Clear interim on stop
                };
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [continuous, interimResults, lang]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setError(null);
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Speech recognition start error:", err);
                // If it's already started, we just ensure state reflects it
                setIsListening(true);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setFinalTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        transcript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
        isSupported,
        error,
    };
}
