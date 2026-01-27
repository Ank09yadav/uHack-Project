"use client";

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages, Settings } from 'lucide-react';
import { useSpeechToText } from '@/lib/hooks/useSpeechToText';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';
import { useTranslation } from 'react-i18next';

interface VoiceAssistantProps {
    onTextInput?: (text: string) => void;
    onCommand?: (command: string) => void;
    placeholder?: string;
    autoSpeak?: boolean;
}

export default function VoiceAssistant({
    onTextInput,
    onCommand,
    placeholder = "Speak to type...",
    autoSpeak = true
}: VoiceAssistantProps) {
    const { t, i18n } = useTranslation();
    const [text, setText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [language, setLanguage] = useState('en-US');
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const {
        transcript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
        isSupported: sttSupported,
        error: sttError
    } = useSpeechToText({
        continuous: true,
        interimResults: true,
        lang: language
    });

    const {
        speak,
        stop: stopSpeaking,
        isSpeaking: ttsIsSpeaking,
        isSupported: ttsSupported
    } = useTextToSpeech({
        lang: language
    });

    useEffect(() => {
        if (transcript) {
            setText(transcript);
            onTextInput?.(transcript);
        }
    }, [transcript, onTextInput]);

    useEffect(() => {
        if (autoSpeak && voiceEnabled && text && !isListening) {
            const timer = setTimeout(() => {
                speakText(text);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [text, isListening, autoSpeak, voiceEnabled]);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            setText('');
            startListening();
        }
    };

    const speakText = (textToSpeak: string) => {
        if (ttsSupported && voiceEnabled) {
            setIsSpeaking(true);
            speak(textToSpeak);
        }
    };

    const toggleVoice = () => {
        if (isSpeaking || ttsIsSpeaking) {
            stopSpeaking();
            setIsSpeaking(false);
        }
        setVoiceEnabled(!voiceEnabled);
    };

    const changeLanguage = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang.split('-')[0]);
    };

    const clearText = () => {
        setText('');
        resetTranscript();
    };

    const handleCommand = (cmd: string) => {
        const lowerCmd = cmd.toLowerCase();

        if (lowerCmd.includes('clear') || lowerCmd.includes('delete')) {
            clearText();
            speakText('Text cleared');
        } else if (lowerCmd.includes('read') || lowerCmd.includes('speak')) {
            speakText(text);
        } else if (lowerCmd.includes('stop')) {
            stopListening();
            stopSpeaking();
        } else if (lowerCmd.includes('help')) {
            speakText('You can say: clear, read, stop, or just speak naturally to type');
        } else {
            onCommand?.(cmd);
        }
    };

    if (!sttSupported && !ttsSupported) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                    ⚠️ Voice features are not supported in your browser. Please use Chrome, Edge, or Safari.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-purple-500'}`}>
                        {isListening ? (
                            <Mic className="w-5 h-5 text-white" />
                        ) : (
                            <MicOff className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">🎤 Voice Assistant</h3>
                        <p className="text-sm text-gray-600">
                            {isListening ? 'Listening... Speak now' : 'Click mic to start speaking'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleVoice}
                        className={`p-2 rounded-lg transition-colors ${voiceEnabled
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
                    >
                        {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Language Settings
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { code: 'en-US', name: 'English', flag: '🇺🇸' },
                            { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
                            { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
                            { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
                            { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
                            { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
                            { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
                            { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`p-3 rounded-lg border-2 transition-all ${language === lang.code
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{lang.flag}</div>
                                <div className="text-xs font-medium text-gray-700">{lang.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    className="w-full min-h-[120px] p-4 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-lg"
                    disabled={isListening}
                />
                {text && (
                    <button
                        onClick={clearText}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear text"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={toggleListening}
                    className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                >
                    {isListening ? (
                        <>
                            <MicOff className="w-5 h-5" />
                            Stop Listening
                        </>
                    ) : (
                        <>
                            <Mic className="w-5 h-5" />
                            Start Speaking
                        </>
                    )}
                </button>

                {text && (
                    <>
                        <button
                            onClick={() => speakText(text)}
                            disabled={isSpeaking || !ttsSupported}
                            className="px-6 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Volume2 className="w-5 h-5" />
                            {isSpeaking ? 'Speaking...' : 'Read Aloud'}
                        </button>

                        <button
                            onClick={() => onTextInput?.(text)}
                            className="px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                            ✓ Submit
                        </button>
                    </>
                )}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">💡 Voice Commands:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
                    <div>• Say "clear" to delete text</div>
                    <div>• Say "read" to hear text</div>
                    <div>• Say "stop" to stop</div>
                    <div>• Say "help" for more</div>
                </div>
            </div>

            {sttError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                        ⚠️ Error: {sttError}. Please check microphone permissions.
                    </p>
                </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${sttSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                    Speech-to-Text: {sttSupported ? 'Ready' : 'Not Available'}
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ttsSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                    Text-to-Speech: {ttsSupported ? 'Ready' : 'Not Available'}
                </div>
                <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {language}
                </div>
            </div>
        </div>
    );
}
