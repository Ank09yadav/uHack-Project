"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Heart, Star, Trophy, ArrowRight, RefreshCw, Zap } from 'lucide-react';

const CHALLENGES = [
    { id: 1, gesture: "Namaste / Hello", points: 50, icon: "🙏" },
    { id: 2, gesture: "Thank You / Please", points: 80, icon: "👋" },
    { id: 3, gesture: "Victory", points: 30, icon: "✌️" },
    { id: 4, gesture: "I Love You", points: 100, icon: "🤟" },
];

export const SignGame: React.FC<{ currentGesture: string | null }> = ({ currentGesture }) => {
    const [score, setScore] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLevelUp, setIsLevelUp] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    useEffect(() => {
        if (currentGesture === CHALLENGES[currentStep].gesture) {
            handleCorrectSign();
        }
    }, [currentGesture]);

    const handleCorrectSign = () => {
        const newScore = score + CHALLENGES[currentStep].points;
        setScore(newScore);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);

        if (currentStep < CHALLENGES.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsLevelUp(true);
        }
    };

    const resetGame = () => {
        setCurrentStep(0);
        setScore(0);
        setIsLevelUp(false);
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-8 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-50 blur-3xl" />

            <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-gray-900">SignQuest: The Game</h2>
                        <p className="text-sm font-medium text-purple-600">Level 1: Basic Greetings</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-2xl bg-orange-100 px-4 py-2 text-orange-600 border border-orange-200">
                            <Zap size={18} fill="currentColor" />
                            <span className="font-bold">{streak} Streak</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-purple-600 px-6 py-3 text-white shadow-lg shadow-purple-200">
                            <Trophy size={20} />
                            <span className="text-xl font-black">{score}</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!isLevelUp ? (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center py-10"
                        >
                            <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xl shadow-purple-200">
                                <span className="text-8xl">{CHALLENGES[currentStep].icon}</span>
                            </div>
                            <h3 className="mb-2 text-3xl font-bold text-gray-900">Show the "{CHALLENGES[currentStep].gesture}" sign</h3>
                            <p className="mb-8 text-gray-500 font-medium">Hold the sign steady for detection</p>

                            <div className="flex gap-4">
                                {CHALLENGES.map((c, i) => (
                                    <div
                                        key={c.id}
                                        className={`h-3 w-12 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-purple-600' : 'bg-gray-100'}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="win"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center py-12 text-center"
                        >
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 text-white shadow-xl">
                                <Star size={48} fill="currentColor" />
                            </div>
                            <h2 className="mb-2 text-4xl font-black text-gray-900">YOU'RE A STAR!</h2>
                            <p className="mb-8 text-xl text-gray-600">You've mastered the basic greetings!</p>
                            <button
                                onClick={resetGame}
                                className="flex items-center gap-2 rounded-2xl bg-gray-900 px-10 py-4 font-bold text-white transition-all hover:scale-105 hover:bg-gray-800"
                            >
                                <RefreshCw size={20} />
                                Play Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {currentGesture && !isLevelUp && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-gray-100 bg-white/80 px-6 py-3 shadow-xl backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <span className="text-xs uppercase tracking-widest text-gray-400">Current:</span>
                                <span>{currentGesture}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
