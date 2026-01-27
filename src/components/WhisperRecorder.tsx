
"use client";

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, UploadCloud } from 'lucide-react';

export function WhisperRecorder({ onTranscriptionComplete }: { onTranscriptionComplete: (text: string) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await sendToWhisper(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
        }
    };

    const sendToWhisper = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');

            // Send to Python Backend (via Proxy)
            const response = await fetch('/api/python/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ detail: response.statusText }));
                onTranscriptionComplete(`Error: ${errData.detail || response.statusText}`);
                return;
            }

            const data = await response.json();
            onTranscriptionComplete(data.text);
        } catch (error) {
            console.error("Transcription failed:", error);
            // Fallback mock if backend is down
            onTranscriptionComplete("Error: Could not connect to transcription service. Is the backend running?");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                >
                    <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
                    <Mic size={18} className="animate-pulse" />
                    {isProcessing ? 'Processing Audio...' : 'Voice Input (Whisper)'}
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-600 animate-pulse"
                >
                    <Square size={18} fill="currentColor" />
                    Stop Recording
                </button>
            )}

            {isProcessing && <Loader2 className="animate-spin text-blue-500" size={20} />}
        </div>
    );
}
