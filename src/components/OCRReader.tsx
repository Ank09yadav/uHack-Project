
"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, Loader2, Copy, Check, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';

export function OCRReader() {
    const [image, setImage] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [accessibilityReport, setAccessibilityReport] = useState<{ status: string; feedback: string[] } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { speak, isSpeaking } = useTextToSpeech();

    const handleAnalyzeAccessibility = async (imageData: string, file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/python/analyze-image', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setAccessibilityReport(data);
            }
        } catch (e) {
            console.error("Accessibility Check Failed", e);
        }
    };

    const preprocessImage = (imageSrc: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(imageSrc);
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const contrast = 1.2;
                    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    const color = factor * (avg - 128) + 128;
                    data[i] = color;
                    data[i + 1] = color;
                    data[i + 2] = color;
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            };
        });
    };

    const processImage = async (imageData: string) => {
        setIsProcessing(true);
        setProgress(0);
        setExtractedText('');

        try {
            const processedImage = await preprocessImage(imageData);

            const worker = await createWorker('eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                },
            });

            const { data: { text } } = await worker.recognize(processedImage);
            setExtractedText(text);

            await worker.terminate();
        } catch (error) {
            console.error('OCR Error:', error);
            setExtractedText('Error extracting text. Please try again with a clearer image.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target?.result as string;
            setImage(imageData);
            setAccessibilityReport(null);

            await Promise.all([
                processImage(imageData),
                handleAnalyzeAccessibility(imageData, file)
            ]);
        };
        reader.readAsDataURL(file);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReadAloud = () => {
        if (extractedText) {
            speak(extractedText);
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                <div className="mb-6">
                    <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <FileImage className="text-blue-500" size={28} />
                        Image to Text (OCR)
                    </h2>
                    <p className="text-gray-600">
                        Upload an image with text and we'll extract it for you. Perfect for reading textbooks, worksheets, or handwritten notes!
                    </p>
                </div>

                {!image && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
                    >
                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="mb-2 text-lg font-medium text-gray-700">Click to upload an image</p>
                        <p className="text-sm text-gray-500">Supports JPG, PNG, and other image formats</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                )}

                <AnimatePresence>
                    {image && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {accessibilityReport && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`mb-6 rounded-lg border p-4 ${accessibilityReport.status === 'Good'
                                        ? 'border-green-200 bg-green-50 text-green-800'
                                        : 'border-yellow-200 bg-yellow-50 text-yellow-800'
                                        }`}>
                                    <h4 className="flex items-center gap-2 font-semibold">
                                        {accessibilityReport.status === 'Good' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        Visual Accessibility Check: {accessibilityReport.status}
                                    </h4>
                                    {accessibilityReport.feedback.length > 0 && (
                                        <ul className="mt-2 list-inside list-disc text-sm space-y-1">
                                            {accessibilityReport.feedback.map((msg, i) => (
                                                <li key={i}>{msg}</li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.div>
                            )}

                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <img src={image} alt="Uploaded" className="w-full" />
                            </div>

                            {isProcessing && (
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-blue-900">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span className="font-medium">Extracting text...</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-blue-200">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-blue-700">{progress}% complete</p>
                                </div>
                            )}

                            {extractedText && !isProcessing && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Extracted Text</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleReadAloud}
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isSpeaking
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <Volume2 size={16} />
                                                <span>{isSpeaking ? 'Speaking...' : 'Read Aloud'}</span>
                                            </button>
                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                                            >
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto rounded-lg bg-white p-4">
                                        <p className="whitespace-pre-wrap text-gray-700">{extractedText}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setImage(null);
                                    setExtractedText('');
                                    setAccessibilityReport(null);
                                    fileInputRef.current?.click();
                                }}
                                className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
                            >
                                Upload Another Image
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
