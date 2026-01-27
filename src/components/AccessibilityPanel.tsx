"use client";

import React from 'react';
import { Settings, Type, Eye, Palette, Zap } from 'lucide-react';
import { useAccessibility, AccessibilityMode } from '@/lib/contexts/AccessibilityContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function AccessibilityPanel() {
    const { t } = useTranslation();
    const { settings, updateSettings, setMode } = useAccessibility();
    const [isOpen, setIsOpen] = React.useState(false);

    const modes: { value: AccessibilityMode; label: string; description: string; icon: React.ReactNode }[] = [
        {
            value: 'default',
            label: t('accessibility.default'),
            description: t('accessibility.defaultDesc'),
            icon: <Eye size={18} />
        },
        {
            value: 'dyslexia',
            label: t('accessibility.dyslexia'),
            description: t('accessibility.dyslexiaDesc'),
            icon: <Type size={18} />
        },
        {
            value: 'high-contrast',
            label: t('accessibility.highContrast'),
            description: t('accessibility.highContrastDesc'),
            icon: <Palette size={18} />
        },
        {
            value: 'calm',
            label: t('accessibility.calm'),
            description: t('accessibility.calmDesc'),
            icon: <Zap size={18} />
        },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Accessibility Settings</h3>

                        <div className="mb-6 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Display Mode</label>
                            <div className="space-y-2">
                                {modes.map((mode) => (
                                    <button
                                        key={mode.value}
                                        onClick={() => setMode(mode.value)}
                                        className={`w-full rounded-lg border p-3 text-left transition-all ${settings.mode === mode.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={settings.mode === mode.value ? 'text-blue-500' : 'text-gray-400'}>
                                                {mode.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{mode.label}</div>
                                                <div className="text-xs opacity-75">{mode.description}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                                <span>Font Size</span>
                                <span className="text-blue-600">{settings.fontSize}px</span>
                            </label>
                            <input
                                type="range"
                                min="12"
                                max="24"
                                value={settings.fontSize}
                                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                                className="w-full accent-blue-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Reduced Motion</span>
                                <input
                                    type="checkbox"
                                    checked={settings.reducedMotion}
                                    onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                                    className="h-5 w-5 rounded accent-blue-500"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Text-to-Speech</span>
                                <input
                                    type="checkbox"
                                    checked={settings.textToSpeechEnabled}
                                    onChange={(e) => updateSettings({ textToSpeechEnabled: e.target.checked })}
                                    className="h-5 w-5 rounded accent-blue-500"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Speech-to-Text</span>
                                <input
                                    type="checkbox"
                                    checked={settings.speechToTextEnabled}
                                    onChange={(e) => updateSettings({ speechToTextEnabled: e.target.checked })}
                                    className="h-5 w-5 rounded accent-blue-500"
                                />
                            </label>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                aria-label="Accessibility settings"
                title="Accessibility settings"
            >
                {!isOpen && <span className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-20 duration-1000"></span>}
                <Settings size={26} className={isOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </button>
        </div>
    );
}
