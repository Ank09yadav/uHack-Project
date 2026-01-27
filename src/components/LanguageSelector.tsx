"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' }
];

interface LanguageSelectorProps {
    compact?: boolean;
    showLabel?: boolean;
}

export default function LanguageSelector({ compact = false, showLabel = true }: LanguageSelectorProps) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);

        // Save preference to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferredLanguage', langCode);
        }
    };

    if (compact) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:border-purple-500 transition-colors"
                >
                    <span className="text-xl">{currentLanguage.flag}</span>
                    <Languages className="w-4 h-4 text-gray-600" />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-purple-50 transition-colors ${currentLanguage.code === lang.code ? 'bg-purple-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{lang.flag}</span>
                                        <div className="text-left">
                                            <div className="font-medium text-gray-900">{lang.nativeName}</div>
                                            <div className="text-xs text-gray-500">{lang.name}</div>
                                        </div>
                                    </div>
                                    {currentLanguage.code === lang.code && (
                                        <Check className="w-5 h-5 text-purple-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {showLabel && (
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Select Language / भाषा चुनें
                </label>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${currentLanguage.code === lang.code
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        <div className="text-3xl mb-2">{lang.flag}</div>
                        <div className="font-medium text-gray-900 text-sm">{lang.nativeName}</div>
                        <div className="text-xs text-gray-500">{lang.name}</div>
                        {currentLanguage.code === lang.code && (
                            <div className="mt-2 flex justify-center">
                                <Check className="w-5 h-5 text-purple-600" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
