"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

export default function ToolPlaceholderPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto max-w-4xl px-4 py-8">
                <Link href="/dashboard" className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-16 text-center shadow-lg">
                    <div className="mb-6 rounded-full bg-yellow-100 p-6 text-yellow-600">
                        <Construction size={48} />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Coming Soon</h1>
                    <p className="max-w-md text-lg text-gray-600">
                        This tool is currently under development. We're working hard to bring you the best accessible learning experience!
                    </p>
                    <Link
                        href="/dashboard"
                        className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                    >
                        Explore Other Tools
                    </Link>
                </div>
            </main>
        </div>
    );
}
