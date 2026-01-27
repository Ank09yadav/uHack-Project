"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Save, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { aiService } from '@/lib/services/aiService';


import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [trainingData, setTrainingData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    React.useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user || (session.user as any).role !== 'admin') {
            router.push('/auth');
        }
    }, [session, status, router]);

    const handleTrain = async () => {
        if (!trainingData.trim()) return;

        setIsSubmitting(true);
        setStatusMsg({ type: null, message: '' });

        try {
            const success = await aiService.trainModel(trainingData);
            if (success) {
                setStatusMsg({ type: 'success', message: 'Knowledge successfully added to the AI model!' });
                setTrainingData('');
            } else {
                setStatusMsg({ type: 'error', message: 'Failed to update knowledge base.' });
            }
        } catch (error) {
            setStatusMsg({ type: 'error', message: 'An error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">AI Training Center 🧠</h1>
                        <p className="mt-2 text-gray-600">Teach the AI new facts and context to improve its responses.</p>
                    </div>

                    <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
                        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                            <Database className="text-purple-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-800">Add to Knowledge Base</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Training Content
                                </label>
                                <textarea
                                    value={trainingData}
                                    onChange={(e) => setTrainingData(e.target.value)}
                                    placeholder="Enter text, facts, or documentation here..."
                                    className="h-64 w-full rounded-xl border border-gray-300 p-4 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    This information will be indexed and used by the AI to answer future questions.
                                </p>
                            </div>

                            {statusMsg.type && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`flex items-center gap-2 rounded-lg p-3 ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    <span className="text-sm font-medium">{statusMsg.message}</span>
                                </motion.div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleTrain}
                                    disabled={isSubmitting || !trainingData.trim()}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <Save size={20} />
                                    {isSubmitting ? 'Training...' : 'Train Model'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
