"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import '@/lib/i18n';

export type AccessibilityMode = 'default' | 'dyslexia' | 'high-contrast' | 'calm';
export type ColorBlindnessMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface AccessibilitySettings {
    mode: AccessibilityMode;
    fontSize: number;
    textToSpeechEnabled: boolean;
    speechToTextEnabled: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    colorBlindnessMode: ColorBlindnessMode;
    enhancedFocus: boolean;
    screenReaderLayout: boolean;
}

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
    setMode: (mode: AccessibilityMode) => void;
}

const defaultSettings: AccessibilitySettings = {
    mode: 'default',
    fontSize: 16,
    textToSpeechEnabled: false,
    speechToTextEnabled: false,
    reducedMotion: false,
    highContrast: false,
    colorBlindnessMode: 'none',
    enhancedFocus: false,
    screenReaderLayout: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

    useEffect(() => {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
            try {
                // Merge with defaults to ensure new settings exist
                const parsed = JSON.parse(saved);
                setSettings({ ...defaultSettings, ...parsed });
            } catch (e) {
                console.error('Failed to parse accessibility settings', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));

        document.documentElement.style.fontSize = `${settings.fontSize}px`;

        // Apply classes for CSS targeting
        const classes = {
            'high-contrast': settings.highContrast,
            'reduce-motion': settings.reducedMotion,
            'enhanced-focus': settings.enhancedFocus,
            'screen-reader-optimized': settings.screenReaderLayout
        };

        Object.entries(classes).forEach(([className, active]) => {
            if (active) document.documentElement.classList.add(className);
            else document.documentElement.classList.remove(className);
        });

        // Color Blindness
        document.documentElement.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia');
        if (settings.colorBlindnessMode !== 'none') {
            document.documentElement.classList.add(`cb-${settings.colorBlindnessMode}`);
        }

        document.documentElement.className = document.documentElement.className
            .split(' ')
            .filter(c => !c.startsWith('mode-'))
            .join(' ');
        document.documentElement.classList.add(`mode-${settings.mode}`);
    }, [settings]);

    const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const setMode = (mode: AccessibilityMode) => {
        updateSettings({ mode });
    };

    return (
        <AccessibilityContext.Provider value={{ settings, updateSettings, setMode }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
}
