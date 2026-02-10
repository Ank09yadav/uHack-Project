"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { IEPGenerator } from '@/components/IEPGenerator';

export default function ToolPlaceholderPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto max-w-5xl px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-2 text-blue-600">
                        <FileText size={20} />
                        <span className="font-bold uppercase tracking-widest text-xs">Accessibility Tools</span>
                    </div>
                </div>

                <div className="mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h1 className="text-4xl font-black mb-4">IEP Generator</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg italic">
                        "Empowering every student with a personalized path to success through AI-driven insights."
                    </p>
                </div>

                <IEPGenerator />

                <div className="mt-12 rounded-3xl bg-indigo-50 p-8 border border-indigo-100 italic text-indigo-700 text-center">
                    <p className="text-sm">
                        <b>Note:</b> This report is generated based on your platform activity, quiz performance, and focus patterns.
                        It is intended as a supporting tool for educators and parents.
                    </p>
                </div>
            </main>
        </div>
    );
}
