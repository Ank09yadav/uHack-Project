"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send, X, Loader2, Sparkles, Mic } from 'lucide-react';
import { aiService } from '@/lib/services/aiService';
import { useSpeechToText } from '@/lib/hooks/useSpeechToText';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';
import { WhisperRecorder } from '@/components/WhisperRecorder';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AskAI() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your AI learning assistant. Ask me anything about your lessons, and I'll help you understand better! 🎓",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { transcript, isListening, startListening, stopListening, resetTranscript } = useSpeechToText();
    const { speak } = useTextToSpeech();

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        resetTranscript();
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await aiService.answerQuestion(input, history);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            speak(response.content);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again!",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 left-0 flex h-[500px] w-[380px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles size={20} />
                                <h3 className="font-semibold">AI Assistant</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 transition-colors hover:bg-white/20"
                                aria-label="Close AI assistant"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                        <p className="mt-1 text-xs opacity-70">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {messages.length === 1 && (
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {[
                                        t('nav.learn'),
                                        t('accessibility.signLanguage'),
                                        "OCR?",
                                        "Quiz"
                                    ].map(prompt => (
                                        <button
                                            key={prompt}
                                            onClick={() => setInput(prompt)}
                                            className="p-2 text-xs text-left bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl bg-gray-100 px-4 py-2">
                                        <div className="flex gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>


                        {/* Input */}
                        <div className="border-t border-gray-200 p-4">
                            <div className="mb-2 flex justify-end">
                                <WhisperRecorder onTranscriptionComplete={(text) => setInput(prev => prev + ' ' + text)} />
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={t('voice.speakToType')}
                                        className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-10 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={toggleVoiceInput}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        aria-label="Voice input"
                                    >
                                        <Mic size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
                                    aria-label="Send message"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all hover:shadow-xl hover:scale-110"
                aria-label="Open AI assistant"
            >
                <MessageCircle size={24} />
            </button>
        </div>
    );
}
