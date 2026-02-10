"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { AskAI } from '@/components/AskAI';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Download,
    Trash2,
    Save
} from 'lucide-react';
import { useAccessibility } from '@/lib/contexts/AccessibilityContext';
import i18n from '@/lib/i18n';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { settings, updateSettings } = useAccessibility();
    const [saved, setSaved] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user) {
            router.push('/auth');
        }
    }, [session, status, router]);

    // Form State
    const [formData, setFormData] = React.useState({
        name: 'John Doe',
        email: 'john@example.com',
        grade: '10th Grade'
    });
    const [profileImage, setProfileImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    // Update form data from session if available
    React.useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user?.name || prev.name,
                email: session.user?.email || prev.email
            }));
        }
    }, [session]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save Profile Data (Mock)
            console.log("Saving data:", formData);

            // 2. Upload Photo if selected
            if (profileImage) {
                const data = new FormData();
                data.append('file', profileImage);

                // Use proxy
                const res = await fetch('/api/python/save-profile', {
                    method: 'POST',
                    body: data
                });

                if (!res.ok) throw new Error('Failed to save profile image');

                const result = await res.json();
                console.log("Image processed:", result);
                if (!result.face_detected) {
                    alert('Warning: No face detected in profile photo!');
                }
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save settings. Is the backend running?");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />

            <main id="main-content" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">{t('nav.settings')}</h1>
                    <p className="text-lg text-gray-600">Customize your learning experience</p>
                </motion.div>

                <div className="space-y-6">
                    {/* Accessibility Settings */}
                    <SettingsSection
                        icon={<Palette className="text-purple-500" size={24} />}
                        title={t('nav.settings')}
                        description="Customize display and interaction preferences"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Font Size: {settings.fontSize}px
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

                            <ToggleField
                                label={t('features.tts.title')}
                                description={t('features.tts.description')}
                                checked={settings.textToSpeechEnabled}
                                onChange={(checked) => updateSettings({ textToSpeechEnabled: checked })}
                            />

                            <ToggleField
                                label={t('features.stt.title')}
                                description={t('features.stt.description')}
                                checked={settings.speechToTextEnabled}
                                onChange={(checked) => updateSettings({ speechToTextEnabled: checked })}
                            />

                            <ToggleField
                                label="Reduced Motion"
                                description="Minimize animations and transitions"
                                checked={settings.reducedMotion}
                                onChange={(checked) => updateSettings({ reducedMotion: checked })}
                            />

                            <ToggleField
                                label="High Contrast"
                                description="Increase color contrast for better visibility"
                                checked={settings.highContrast}
                                onChange={(checked) => updateSettings({ highContrast: checked })}
                            />

                            <SelectField
                                label="Color Blindness Filter"
                                options={['None', 'Protanopia', 'Deuteranopia', 'Tritanopia']}
                                value={settings.colorBlindnessMode.charAt(0).toUpperCase() + settings.colorBlindnessMode.slice(1)}
                                onChange={(val) => updateSettings({ colorBlindnessMode: val.toLowerCase() as any })}
                            />

                            <ToggleField
                                label="Enhanced Focus Indicators"
                                description="Make the keyboard focus highlight more prominent"
                                checked={settings.enhancedFocus}
                                onChange={(checked) => updateSettings({ enhancedFocus: checked })}
                            />

                            <ToggleField
                                label="Screen Reader Layout"
                                description="Optimize layout for screen reading software"
                                checked={settings.screenReaderLayout}
                                onChange={(checked) => updateSettings({ screenReaderLayout: checked })}
                            />
                        </div>
                    </SettingsSection>

                    {/* Notification Settings */}
                    <SettingsSection
                        icon={<Bell className="text-yellow-500" size={24} />}
                        title="Notifications"
                        description="Control how you receive updates"
                    >
                        <div className="space-y-4">
                            <ToggleField
                                label="Learning Reminders"
                                description="Get daily reminders to continue learning"
                                checked={true}
                                onChange={() => { }}
                            />

                            <ToggleField
                                label="Achievement Alerts"
                                description="Notifications when you unlock achievements"
                                checked={true}
                                onChange={() => { }}
                            />

                            <ToggleField
                                label="Weekly Progress Report"
                                description="Receive weekly summary of your progress"
                                checked={false}
                                onChange={() => { }}
                            />
                        </div>
                    </SettingsSection>

                    {/* Learning Preferences */}
                    <SettingsSection
                        icon={<Globe className="text-green-500" size={24} />}
                        title="Learning Preferences"
                        description="Customize your learning experience"
                    >
                        <div className="space-y-4">
                            <SelectField
                                label="Preferred Language"
                                options={['English', 'Spanish', 'French', 'German', 'Hindi']}
                                value={i18n.language === 'hi' ? 'Hindi' : i18n.language === 'es' ? 'Spanish' : i18n.language === 'fr' ? 'French' : i18n.language === 'de' ? 'German' : 'English'}
                                onChange={(val) => {
                                    const langMap: { [key: string]: string } = {
                                        'English': 'en',
                                        'Spanish': 'es',
                                        'French': 'fr',
                                        'German': 'de',
                                        'Hindi': 'hi'
                                    };
                                    const langCode = langMap[val] || 'en';
                                    i18n.changeLanguage(langCode);
                                    localStorage.setItem('preferredLanguage', langCode);
                                }}
                            />

                            <SelectField
                                label="Difficulty Level"
                                options={['Beginner', 'Intermediate', 'Advanced', 'Auto-Adapt']}
                                value="Auto-Adapt"
                                onChange={() => { }}
                            />

                            <SelectField
                                label="Learning Pace"
                                options={['Slow', 'Medium', 'Fast', 'Self-Paced']}
                                value="Self-Paced"
                                onChange={() => { }}
                            />
                        </div>
                    </SettingsSection>

                    {/* Privacy & Data */}
                    <SettingsSection
                        icon={<Shield className="text-red-500" size={24} />}
                        title="Privacy & Data"
                        description="Manage your data and privacy settings"
                    >
                        <div className="space-y-4">
                            <button className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Download className="text-blue-500" size={20} />
                                    <div>
                                        <div className="font-medium text-gray-900">Export Data</div>
                                        <div className="text-sm text-gray-500">Download all your learning data</div>
                                    </div>
                                </div>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left transition-colors hover:bg-red-100">
                                <div className="flex items-center gap-3">
                                    <Trash2 className="text-red-500" size={20} />
                                    <div>
                                        <div className="font-medium text-red-900">Delete Account</div>
                                        <div className="text-sm text-red-600">Permanently delete your account and data</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </SettingsSection>

                    {/* Save Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="sticky bottom-6 flex justify-end"
                    >
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white shadow-lg transition-all ${saved
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl'
                                }`}
                        >
                            <Save size={20} />
                            <span>{saved ? 'Saved!' : 'Save Changes'}</span>
                        </button>
                    </motion.div>
                </div>
            </main>

            <AccessibilityPanel />
            <AskAI />
        </div>
    );
}

function SettingsSection({
    icon,
    title,
    description,
    children
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
        >
            <div className="mb-4 flex items-start gap-3">
                {icon}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
            {children}
        </motion.div>
    );
}

function InputField({
    label,
    type = 'text',
    placeholder,
    value,
    onChange
}: {
    label: string;
    type?: string;
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
        </div>
    );
}

function SelectField({
    label,
    options,
    value,
    onChange
}: {
    label: string;
    options: string[];
    value: string;
    onChange?: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function ToggleField({
    label,
    description,
    checked,
    onChange
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-500">{description}</div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
            >
                <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                />
            </button>
        </div>
    );
}
