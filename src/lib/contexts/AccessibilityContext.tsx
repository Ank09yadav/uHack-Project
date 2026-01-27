"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import '@/lib/i18n';

export type AccessibilityMode = 'default' | 'dyslexia' | 'high-contrast' | 'calm';

interface AccessibilitySettings {
    mode: AccessibilityMode;
    fontSize: number;
    textToSpeechEnabled: boolean;
    speechToTextEnabled: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
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
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

    useEffect(() => {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse accessibility settings', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));

        document.documentElement.style.fontSize = `${settings.fontSize}px`;

        if (settings.highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }

        if (settings.reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
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
