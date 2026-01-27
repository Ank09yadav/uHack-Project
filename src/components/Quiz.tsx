"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Trophy, Brain, Sparkles } from 'lucide-react';
import { QuizQuestion } from '@/lib/services/aiService';
import { TextToSpeechButton } from './TextToSpeechButton';

interface QuizProps {
    questions: QuizQuestion[];
    onComplete: (score: number, correctAnswers: number) => void;
    title?: string;
}

export function Quiz({ questions, onComplete, title = "Quiz Time!" }: QuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
        new Array(questions.length).fill(false)
    );

    const question = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;
    const isCorrect = selectedAnswer === question.correctAnswer;

    const handleAnswerSelect = (index: number) => {
        if (answeredQuestions[currentQuestion]) return;

        setSelectedAnswer(index);
        setShowExplanation(true);

        const newAnswered = [...answeredQuestions];
        newAnswered[currentQuestion] = true;
        setAnsweredQuestions(newAnswered);

        if (index === question.correctAnswer) {
            setCorrectAnswers(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            const score = (correctAnswers / questions.length) * 100;
            onComplete(score, correctAnswers);
        } else {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        }
    };

    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Brain className="text-blue-500" size={28} />
                        {title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                    </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg"
                >
                    <div className="mb-4">
                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${question.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : question.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                        >
                            <Sparkles size={12} />
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-xl font-semibold text-gray-900">{question.question}</h3>
                            <TextToSpeechButton text={question.question} />
                        </div>
                    </div>

                    <div className="mb-6 space-y-3">
                        {question.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrectOption = index === question.correctAnswer;
                            const showCorrect = showExplanation && isCorrectOption;
                            const showIncorrect = showExplanation && isSelected && !isCorrect;

                            return (
                                <motion.button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={answeredQuestions[currentQuestion]}
                                    whileHover={{ scale: answeredQuestions[currentQuestion] ? 1 : 1.02 }}
                                    whileTap={{ scale: answeredQuestions[currentQuestion] ? 1 : 0.98 }}
                                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${showCorrect
                                        ? 'border-green-500 bg-green-50'
                                        : showIncorrect
                                            ? 'border-red-500 bg-red-50'
                                            : isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                        } ${answeredQuestions[currentQuestion] ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{option}</span>
                                        {showCorrect && (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                <Check size={16} className="text-white" />
                                            </div>
                                        )}
                                        {showIncorrect && (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                                                <X size={16} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {showExplanation && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`rounded-lg p-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                                    }`}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    {isCorrect ? (
                                        <>
                                            <Check className="text-green-600" size={20} />
                                            <span className="font-semibold text-green-900">Correct!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="text-blue-600" size={20} />
                                            <span className="font-semibold text-blue-900">Learn More</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700">{question.explanation}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {showExplanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6"
                        >
                            <button
                                onClick={handleNext}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
                            >
                                {isLastQuestion ? (
                                    <>
                                        <Trophy size={20} />
                                        <span>Complete Quiz</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Next Question</span>
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>Correct: {correctAnswers}</span>
                </div>
                <div className="flex items-center gap-2">
                    <X className="text-red-500" size={16} />
                    <span>Incorrect: {answeredQuestions.filter(Boolean).length - correctAnswers}</span>
                </div>
            </div>
        </div>
    );
}
