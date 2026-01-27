"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { AskAI } from '@/components/AskAI';
import { Quiz } from '@/components/Quiz';
import { motion, AnimatePresence } from 'framer-motion';

import {
    BookOpen,
    Play,
    CheckCircle,
    Clock,
    Star,
    Brain,
    Sparkles,
    ChevronRight,
    Award,
    ShieldCheck,
    Users,
    Zap
} from 'lucide-react';
import { TextToSpeechButton } from '@/components/TextToSpeechButton';
import { SignLanguageDetector } from '@/components/SignLanguageDetector';
import { OCRReader } from '@/components/OCRReader';
import { aiService, QuizQuestion } from '@/lib/services/aiService';
import { AttentionMonitor } from '@/components/AttentionMonitor';
import { IEPGenerator } from '@/components/IEPGenerator';
import { SignGame } from '@/components/SignGame';
import { SyncStatus } from '@/components/SyncStatus';

interface LearningModule {
    id: string;
    title: string;
    description: string;
    content: string;
    duration: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    completed: boolean;
    progress: number; // 0-100
}

export default function LearnPage() {
    const [modules, setModules] = useState<LearningModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [moduleCompleted, setModuleCompleted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [attentionAlert, setAttentionAlert] = useState(false);
    const [showIEP, setShowIEP] = useState(false);
    const [currentGameGesture, setCurrentGameGesture] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [simplifiedMode, setSimplifiedMode] = useState(false);

    React.useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await fetch('/api/modules');
                const data = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error('Invalid modules data received');
                }

                const enhancedData = data.map((m: any) => ({
                    ...m,
                    completed: false,
                    progress: 0
                }));
                setModules(enhancedData);
            } catch (error) {
                console.error("Failed to fetch modules", error);
                setError(error instanceof Error ? error.message : 'Failed to load modules');
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    const handleStartModule = (module: LearningModule) => {
        setSelectedModule(module);
        setShowQuiz(false);
        setModuleCompleted(false);
    };

    const handleStartQuiz = async () => {
        if (!selectedModule) return;
        const questions = await aiService.generateQuiz(selectedModule.content, 5);
        setQuizQuestions(questions);
        setShowQuiz(true);
    };

    const handleQuizComplete = (score: number, correctAnswers: number) => {
        setModuleCompleted(true);
        setShowQuiz(false);
        setModules(prev => prev.map(m =>
            m.id === selectedModule?.id ? { ...m, completed: true, progress: 100 } : m
        ));
        if (selectedModule) {
            setSelectedModule({ ...selectedModule, completed: true, progress: 100 });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-gray-600 font-medium">Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-10 ${simplifiedMode ? 'bg-white' : 'bg-[#FDFDFD]'}`}>
            <Navbar />
            <SyncStatus />

            <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[10px] font-bold text-gray-400 shadow-lg backdrop-blur-md border border-gray-100">
                <ShieldCheck size={14} className="text-green-500" />
                PRIVACY PROTECTED: ON-DEVICE AI
            </div>

            <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {!selectedModule ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 text-center"
                        >
                            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl tracking-tight">
                                Learning Modules
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-gray-600">
                                Explore adaptive wisdom designed for everyone.
                            </p>
                            {simplifiedMode && (
                                <span className="inline-block mt-4 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                                    Simplified Mode Active
                                </span>
                            )}
                        </motion.div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {modules.map((module, index) => (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                    <div>
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${module.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : module.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {module.difficulty}
                                            </span>
                                            {module.completed && <CheckCircle className="text-green-500" size={20} />}
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                                        <p className="mb-4 text-sm text-gray-600 line-clamp-3 leading-relaxed">{module.description}</p>
                                        <div className="mb-6 flex items-center gap-4 text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-1.5"><Clock size={16} /><span>{module.duration} min</span></div>
                                            <div className="flex items-center gap-1.5"><BookOpen size={16} /><span>{module.category}</span></div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStartModule(module)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
                                    >
                                        <Play size={18} fill="currentColor" />
                                        <span>{module.completed ? 'Review Module' : 'Start Learning'}</span>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : showQuiz ? (
                    <div>
                        <button onClick={() => setShowQuiz(false)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            <ChevronRight size={20} className="rotate-180" /> Back to Module
                        </button>
                        <Quiz questions={quizQuestions} onComplete={handleQuizComplete} title={`${selectedModule.title} - Quiz`} />
                    </div>
                ) : moduleCompleted ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl text-center">
                        <div className="rounded-3xl border border-gray-100 bg-white p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 -z-10" />
                            <div className="mb-8 flex justify-center">
                                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-300 to-orange-400 shadow-xl">
                                    <Award size={64} className="text-white" />
                                </div>
                            </div>
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Module Completed! 🎉</h2>
                            <p className="mb-10 text-xl text-gray-600">Outstanding work! You've mastered "{selectedModule.title}"</p>
                            <button onClick={() => setSelectedModule(null)} className="rounded-xl bg-gray-900 px-10 py-4 font-bold text-white hover:bg-gray-800">Explore More</button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="mx-auto max-w-4xl">
                        <button onClick={() => setSelectedModule(null)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            <ChevronRight size={20} className="rotate-180" /> Back to Modules
                        </button>

                        <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="text-3xl font-bold text-gray-900">{selectedModule.title}</h1>
                                <TextToSpeechButton text={selectedModule.content} variant="button" />
                            </div>
                            <p className="mb-6 text-lg text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-4 bg-gray-50 py-2 rounded-r-lg">{selectedModule.description}</p>
                        </div>

                        <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-10 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
                            {selectedModule.id === 'sign-language' ? (
                                <SignLanguageDetector onGesture={setCurrentGameGesture} />
                            ) : selectedModule.id === 'ocr-reader' ? (
                                <OCRReader />
                            ) : (
                                <div className="prose prose-lg max-w-none">
                                    {selectedModule.content.split('\n\n').map((p, i) => <p key={i} className="mb-6">{p}</p>)}
                                </div>
                            )}
                        </div>

                        {selectedModule.id === 'sign-language' && (
                            <div className="mb-8">
                                <h2 className="mb-4 text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Zap size={20} className="text-yellow-500" /> Interactive Practice
                                </h2>
                                <SignGame currentGesture={currentGameGesture} />
                            </div>
                        )}

                        {!showIEP ? (
                            <div className="mb-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
                                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                                    <div>
                                        <h2 className="text-3xl font-black">Generate your Personalized IEP</h2>
                                        <p className="text-blue-100">Our AI has enough data to create your Roadmap.</p>
                                    </div>
                                    <button onClick={() => setShowIEP(true)} className="rounded-2xl bg-white px-8 py-4 font-bold text-blue-600 transition-all hover:scale-105">View Roadmap</button>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-12"><IEPGenerator /></div>
                        )}

                        {selectedModule.id !== 'sign-language' && selectedModule.id !== 'ocr-reader' && (
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <button onClick={handleStartQuiz} className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-bold text-white hover:shadow-xl">
                                    <Brain size={24} className="group-hover:animate-bounce" />
                                    <span className="text-lg">Take AI Quiz</span>
                                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <AccessibilityPanel />
            <AskAI />

            <AttentionMonitor
                isActive={!!selectedModule && !moduleCompleted && !showQuiz && !simplifiedMode}
                onAttentionLoss={() => { setIsPaused(true); setAttentionAlert(true); }}
                onAttentionGain={() => { setAttentionAlert(false); }}
            />

            <AnimatePresence>
                {attentionAlert && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Brain size={40} className="animate-pulse" />
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-gray-900">Take a deep breath?</h2>
                            <p className="mb-8 text-gray-600">We noticed you've been looking away. Would you like to pause or change mode?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { setAttentionAlert(false); setIsPaused(false); }} className="rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-colors">Continue Learning</button>
                                <button onClick={() => { setAttentionAlert(false); setIsPaused(false); setSimplifiedMode(true); }} className="rounded-xl bg-gray-100 py-3 font-bold text-gray-900 hover:bg-gray-200 transition-colors">Switch to Simplified Mode</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
