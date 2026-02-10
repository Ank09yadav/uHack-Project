
"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, FileText, Loader2, Copy, Check, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
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
    const { speak, stop, isSpeaking } = useTextToSpeech();

    const handleLogActivity = async (fileName: string) => {
        try {
            await fetch('/api/dashboard/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity: {
                        type: 'module',
                        title: `Scanned: ${fileName}`,
                        points: 50,
                        meta: { duration: 1 } // Count as 1 min of effort
                    }
                })
            });
        } catch (error) {
            console.warn("Failed to log OCR activity", error);
        }
    };

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
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(imageSrc);

                // Resize for better OCR if too small
                const minWidth = 1000;
                let width = img.width;
                let height = img.height;
                if (width < minWidth) {
                    const ratio = minWidth / width;
                    width = minWidth;
                    height = img.height * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Better Grayscale + Contrast + Thresholding
                for (let i = 0; i < data.length; i += 4) {
                    // Grayscale (Luminance method)
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

                    // High Contrast
                    const contrast = 40; // Increase contrast
                    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    let color = factor * (gray - 128) + 128;

                    // Simple Thresholding (Turn into black and white)
                    color = color > 128 ? 255 : 0;

                    data[i] = color;
                    data[i + 1] = color;
                    data[i + 2] = color;
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
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

        setImage(null);
        setExtractedText('');
        setAccessibilityReport(null);

        if (file.type === 'application/pdf') {
            console.log("PDF file detected, starting processing...");
            setIsProcessing(true);
            try {
                // Dynamically import PDF.js
                const pdfjs = await import('pdfjs-dist');
                console.log("PDF.js module loaded successfully");

                // Use a standard worker URL
                pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
                console.log("Worker source set to:", pdfjs.GlobalWorkerOptions.workerSrc);

                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                console.log(`PDF loaded. Pages: ${pdf.numPages}`);
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context!, viewport, canvas: canvas }).promise;
                    const imageData = canvas.toDataURL('image/jpeg');

                    setProgress(Math.round((i / pdf.numPages) * 100));

                    // We can also extract text directly from PDF if it has text layer
                    // But for "scanned PDFs", we use OCR on the rendered image
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');

                    if (pageText.trim().length > 10) {
                        fullText += pageText + '\n\n';
                    } else {
                        // If page text is empty, it might be a scanned image
                        // Note: For simplicity, we'll try OCR on the first page if it seems like an image
                        // In a real app we might OCR all pages
                        if (i === 1) {
                            const ocrText = await runOCR(imageData);
                            fullText += ocrText + '\n\n';
                        }
                    }
                }
                setExtractedText(fullText || "Could not extract text from this PDF.");
                if (fullText) {
                    await handleLogActivity(file.name);
                }
                // For PDF, we'll set a placeholder or the first page as image if we want
                // For now, let's keep image as null but we could show a PDF icon in the UI
                setImage(null);
            } catch (error: any) {
                console.error('PDF Error Details:', error);
                setExtractedText(`Error processing PDF: ${error.message || 'Unknown error'}. Please try a different PDF.`);
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target?.result as string;
            setImage(imageData);

            await Promise.all([
                processImage(imageData),
                handleAnalyzeAccessibility(imageData, file)
            ]);
        };
        reader.readAsDataURL(file);
    };

    const runOCR = async (imageData: string): Promise<string> => {
        const processedImage = await preprocessImage(imageData);
        const worker = await createWorker('eng', 1);
        const { data: { text } } = await worker.recognize(processedImage);
        await worker.terminate();
        return text;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReadAloud = () => {
        if (isSpeaking) {
            stop();
        } else if (extractedText) {
            speak(extractedText);
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                <div className="mb-6">
                    <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <FileImage className="text-blue-500" size={28} />
                        Document Text Reader (OCR)
                    </h2>
                    <p className="text-gray-600">
                        Upload an Image or PDF with text and we'll extract it for you. Perfect for textbooks, multi-page documents, or notes!
                    </p>
                </div>

                {!image && !isProcessing && !extractedText && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
                    >
                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="mb-2 text-lg font-medium text-gray-700">Click to upload an Image or PDF</p>
                        <p className="text-sm text-gray-500">Supports JPG, PNG, and PDF formats</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                )}

                <AnimatePresence>
                    {(image || isProcessing || extractedText) && (
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

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center p-4">
                                {image ? (
                                    <img src={image} alt="Uploaded" className="w-full" />
                                ) : (
                                    <div className="flex flex-col items-center py-8">
                                        <div className="rounded-full bg-red-100 p-4 text-red-600 mb-2">
                                            <FileText size={48} />
                                        </div>
                                        <p className="font-semibold text-gray-900">PDF Document Loaded</p>
                                        <p className="text-sm text-gray-500">Processing all pages...</p>
                                    </div>
                                )}
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
                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {isSpeaking ? <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full mr-1" /> : <Volume2 size={16} />}
                                                <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
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
                                    setIsProcessing(false);
                                    fileInputRef.current?.click();
                                }}
                                className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
                            >
                                Upload Another Document
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
