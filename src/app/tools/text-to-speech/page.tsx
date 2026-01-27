"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Volume2, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';

export default function TextToSpeechPage() {
    const { speak, stop, isSpeaking, pause, resume } = useTextToSpeech();
    const [text, setText] = useState('');

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
                        <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                            <Volume2 size={32} />
                        </div>
                        Text to Speech
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Convert written text into natural-sounding speech.
                    </p>
                </motion.div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text here to read aloud..."
                        className="w-full h-40 rounded-xl border border-gray-200 bg-gray-50 p-4 text-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none mb-6"
                    />

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => speak(text)}
                            disabled={!text || isSpeaking}
                            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play size={20} />
                            Play
                        </button>
                        <button
                            onClick={stop}
                            disabled={!isSpeaking}
                            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RotateCcw size={20} />
                            Stop
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
