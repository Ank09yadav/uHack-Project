"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { WhisperRecorder } from '@/components/WhisperRecorder';
import { motion } from 'framer-motion';
import { Mic, Copy, Check, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function SpeechToTextPage() {
    const [transcriptions, setTranscriptions] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleTranscription = (text: string) => {
        setTranscriptions(prev => [text, ...prev]);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const downloadTranscript = () => {
        const element = document.createElement("a");
        const file = new Blob([transcriptions.join('\n\n')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "transcript.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto max-w-4xl px-4 py-8">
                <Link href="/dashboard" className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                            <Mic size={32} />
                        </div>
                        Speech to Text Converter
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Use our AI-powered Whisper model to convert your voice into accurate text in real-time.
                    </p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Controls Section */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
                        >
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recorder Controls</h2>

                            <div className="flex flex-col gap-4">
                                <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                                    <p className="mb-3 text-sm text-blue-800">
                                        Click the button below to start recording. Speak clearly into your microphone.
                                    </p>
                                    <WhisperRecorder onTranscriptionComplete={handleTranscription} />
                                </div>

                                {transcriptions.length > 0 && (
                                    <button
                                        onClick={downloadTranscript}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
                                    >
                                        <Download size={18} />
                                        Export Transcript
                                    </button>
                                )}

                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips for best results:</h3>
                                    <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                                        <li>Use a quality microphone</li>
                                        <li>Speak at a moderate pace</li>
                                        <li>Avoid background noise</li>
                                        <li>Supported via OpenAI Whisper</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {transcriptions.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center"
                                >
                                    <div className="mb-4 rounded-full bg-gray-50 p-4">
                                        <Mic size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No transcriptions yet</h3>
                                    <p className="text-gray-500">Record something to see the text appear here.</p>
                                </motion.div>
                            ) : (
                                transcriptions.map((text, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                                    >
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                onClick={() => copyToClipboard(text, i)}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                title="Copy text"
                                            >
                                                {copiedIndex === i ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <div className="pr-10">
                                            <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">{text}</p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                                            <span className="text-xs font-medium text-gray-400">Transcription #{transcriptions.length - i}</span>
                                            <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
