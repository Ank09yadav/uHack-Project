"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { AskAI } from '@/components/AskAI';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [saved, setSaved] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const [showPasswords, setShowPasswords] = React.useState({
        current: false,
        new: false,
        confirm: false
    });

    React.useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user) {
            router.push('/auth');
        }
    }, [session, status, router]);

    // Form State
    const [formData, setFormData] = React.useState({
        name: 'User',
        email: '',
        grade: '10th Grade',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Update Profile & Security
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    grade: formData.grade,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update profile');

            // 2. Upload Photo if selected
            if (profileImage) {
                const imgData = new FormData();
                imgData.append('file', profileImage);

                const imgRes = await fetch('/api/python/save-profile', {
                    method: 'POST',
                    body: imgData
                });

                if (!imgRes.ok) throw new Error('Failed to save profile image');

                const result = await imgRes.json();
                if (!result.face_detected) {
                    alert('Warning: No face detected in profile photo!');
                }
            }

            setSaved(true);
            // Clear password fields on success
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            setTimeout(() => setSaved(false), 2000);
        } catch (error: any) {
            console.error("Save error:", error);
            alert(error.message || "Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link href="/dashboard" className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-lg text-gray-600">Update your security and personal details</p>
                </motion.div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
                        <div className="space-y-10">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center sm:flex-row sm:gap-8 border-b border-gray-100 pb-10">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden border-4 border-white shadow-lg transition-transform group-hover:scale-105">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                <User size={64} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110">
                                        <PlusIcon size={20} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div className="mt-4 text-center sm:mt-0 sm:text-left">
                                    <h3 className="text-xl font-bold text-gray-900">Profile Photo</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        Upload a clear photo. We use AI to ensure your photo meets our platform standards.
                                    </p>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="grid gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User size={20} className="text-blue-600" />
                                        Personal Information
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <InputField
                                            label="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                        <InputField
                                            label="Grade / Level"
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                            placeholder="10th Grade"
                                        />
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div className="rounded-2xl bg-gray-50 p-6 border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <LockIcon size={20} className="text-purple-600" />
                                        Security & Password
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="relative">
                                            <InputField
                                                label="Current Password"
                                                type={showPasswords.current ? "text" : "password"}
                                                value={formData.currentPassword}
                                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute bottom-3 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <div className="hidden md:block" />
                                        <div className="relative">
                                            <InputField
                                                label="New Password"
                                                type={showPasswords.new ? "text" : "password"}
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                className="absolute bottom-3 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <InputField
                                                label="Confirm New Password"
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                className="absolute bottom-3 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-gray-500 italic">
                                        Leave password fields blank if you don't want to change it.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`flex items-center gap-2 rounded-2xl px-10 py-4 font-bold text-white shadow-lg transition-all ${saved
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-gray-900 hover:bg-gray-800 hover:shadow-xl active:scale-95'
                                        }`}
                                >
                                    {isSaving ? (
                                        <span className="animate-pulse">Saving...</span>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            <span>{saved ? 'Changes Saved!' : 'Update Profile'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AccessibilityPanel />
            <AskAI />
        </div>
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
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
        </div>
    );
}

function PlusIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function LockIcon({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
