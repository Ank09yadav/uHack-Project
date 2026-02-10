"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { OCRReader } from '@/components/OCRReader';
import { ArrowLeft, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OCRPage() {
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
                            <FileImage size={32} />
                        </div>
                        OCR Text Reader (Image & PDF)
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Convert Images and PDF documents into editable and accessible text.
                    </p>
                </motion.div>

                <div className="mt-8">
                    <OCRReader />
                </div>
            </main>
        </div>
    );
}
