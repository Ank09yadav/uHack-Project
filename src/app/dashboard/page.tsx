"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { AskAI } from '@/components/AskAI';
import { ProgressTracker } from '@/components/ProgressTracker';
import { motion } from 'framer-motion';
import {
    BookOpen,
    TrendingUp,
    Clock,
    Award,
    Target,
    Zap,
    ChevronRight,
    Search,
    Mic,
    Volume2,
    Eye,
    Brain,
    Video,
    FileText,
    MessageSquare,
    Activity as ActivityIcon
} from 'lucide-react';
import Link from 'next/link';
import { UserStats } from '@/lib/services/gamificationService';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const user = session?.user;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth');
        } else if (status === 'authenticated' && (user as any)?.role === 'teacher') {
            router.push('/teacher');
        }
    }, [status, user, router]);

    // Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (status !== 'authenticated') return;

            try {
                const res = await fetch('/api/dashboard/user');
                if (!res.ok) throw new Error('Failed to load dashboard data');
                const data = await res.json();

                if (!data.user) throw new Error('User data missing from response');

                // Map User Stats
                setStats({
                    totalPoints: data.user.points || 0,
                    level: data.user.level || 1,
                    streak: data.user.streak || 0,
                    achievements: (data.user.achievements || []).map((id: string) => ({
                        id, name: 'Achievement', description: 'Awarded', icon: '🏆', points: 0, unlockedAt: new Date()
                    })),
                    modulesCompleted: data.user.modulesCompleted || 0,
                    totalTimeSpent: data.user.totalTimeSpent || 0
                });

                setGoals(data.goals || []);

                setActivities((data.activities || []).map((a: any) => ({
                    ...a,
                    id: a._id || Math.random().toString(),
                    date: getRelativeTime(a.createdAt),
                    title: a.title || 'Activity',
                    points: a.points || 0
                })));

                setRecommendations((data.recommendedModules || []).map((m: any) => ({
                    id: m._id || m.id,
                    title: m.title,
                    difficulty: m.difficulty || 'beginner',
                    duration: m.duration || 10
                })));

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
                setError(error instanceof Error ? error.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status]);

    const allFeatures = [
        { id: 'stt', title: 'Speech to Text', icon: <Mic size={20} />, description: 'Convert voice to text', href: '/tools/speech-to-text', color: 'bg-blue-500' },
        { id: 'tts', title: 'Text to Speech', icon: <Volume2 size={20} />, description: 'Listen to content', href: '/tools/text-to-speech', color: 'bg-purple-500' },
        { id: 'sign', title: 'Sign Language', icon: <Video size={20} />, description: 'AI Sign Detection', href: '/tools/sign-language', color: 'bg-orange-500' },
        { id: 'ocr', title: 'OCR Reader', icon: <FileText size={20} />, description: 'Extract text from Images/PDF', href: '/tools/ocr', color: 'bg-green-500' },
        { id: 'ai', title: 'AI Tutor', icon: <Brain size={20} />, description: 'Ask questions', href: '/tools/ai-tutor', color: 'bg-pink-500' },
        { id: 'attention', title: 'Attention Monitor', icon: <ActivityIcon size={20} />, description: 'Focus assistance', href: '/tools/attention', color: 'bg-yellow-500' },
        { id: 'eye', title: 'Eye Tracking', icon: <Eye size={20} />, description: 'Control with eyes', href: '/tools/eye-tracking', color: 'bg-indigo-500' },
        { id: 'iep', title: 'IEP Generator', icon: <FileText size={20} />, description: 'Individual Plan', href: '/tools/iep', color: 'bg-teal-500' },
    ];

    const filteredFeatures = allFeatures.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === 'loading' || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        // Fallback to minimal UI in case of error, or just show error
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="mb-4 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white transition-all hover:bg-purple-700 shadow-md"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-10">
            <Navbar />

            <div className="fixed top-20 left-10 -z-10 h-72 w-72 rounded-full bg-blue-100/50 blur-[100px]" />
            <div className="fixed top-40 right-10 -z-10 h-72 w-72 rounded-full bg-purple-100/50 blur-[100px]" />

            <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome back! 👋</h1>
                        <p className="text-lg text-gray-600 mt-2">Ready to learn something new today?</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <ProgressTracker stats={stats} />
                </motion.div>

                {/* Search & Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-8"
                >
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search features (e.g., 'Sign Language', 'OCR')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-lg"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredFeatures.map((feature, i) => (
                            <Link href={feature.href} key={feature.id}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full text-center"
                                >
                                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white ${feature.color}`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                                </motion.div>
                            </Link>
                        ))}
                        {filteredFeatures.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-8">
                                No features found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-xl backdrop-blur-xl"
                        >
                            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                    <Clock size={20} />
                                </span>
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {activities.length > 0 ? activities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                                    >
                                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${activity.type === 'module' ? 'bg-blue-50 text-blue-600' :
                                                activity.type === 'quiz' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-yellow-50 text-yellow-600'
                                                }`}>
                                                {activity.type === 'module' ? <BookOpen size={24} /> :
                                                    activity.type === 'quiz' ? <Target size={24} /> :
                                                        <Award size={24} />}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{activity.title}</div>
                                                <div className="text-sm text-gray-500">{activity.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 font-bold text-gray-900">
                                                <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                                                +{activity.points}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">points</div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center text-gray-500">No recent activity</div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-xl backdrop-blur-xl"
                        >
                            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                    <Target size={20} />
                                </span>
                                Weekly Goals
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {goals.length > 0 ? (
                                    goals.map((goal, i) => (
                                        <GoalProgress
                                            key={i}
                                            label={goal.title}
                                            current={goal.current}
                                            target={goal.target}
                                            color={goal.color === 'blue' ? "from-blue-500 to-cyan-500" :
                                                goal.color === 'green' ? "from-green-500 to-emerald-500" :
                                                    goal.color === 'purple' ? "from-purple-500 to-violet-500" :
                                                        "from-orange-500 to-red-500"}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center text-gray-500 text-sm py-4">No active goals found. Start learning to generate some!</div>
                                )}
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-4 flex items-center justify-center text-gray-400 font-medium hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors">
                                    + Add New Goal
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl"
                        >
                            <h2 className="mb-6 text-lg font-bold text-gray-900 uppercase tracking-widest text-opacity-80">
                                This Week
                            </h2>
                            <div className="space-y-4">
                                <QuickStat icon={<BookOpen size={20} className="text-blue-500" />} label="Modules" value={String(stats.modulesCompleted || 0)} />
                                <QuickStat icon={<Clock size={20} className="text-purple-500" />} label="Study Time" value={`${Math.floor(stats.totalTimeSpent / 60)}h ${stats.totalTimeSpent % 60}m`} />
                                <QuickStat icon={<Zap size={20} className="text-yellow-500" />} label="Points Earned" value={String(stats.totalPoints || 0)} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl"
                        >
                            <h2 className="mb-6 text-lg font-bold text-gray-900 uppercase tracking-widest text-opacity-80">
                                Recommended
                            </h2>
                            <div className="space-y-3">
                                {recommendations.map((module, index) => (
                                    <Link
                                        key={module.id || index}
                                        href="/learn"
                                        className="block rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:scale-[1.02]"
                                    >
                                        <div className="mb-2 font-semibold text-gray-900 line-clamp-2">{module.title}</div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <span className={`px-2 py-1 rounded-md ${module.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {module.difficulty}
                                            </span>
                                            <span>•</span>
                                            <span>{module.duration} min</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link
                                href="/learn"
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
                            >
                                <span>Find More</span>
                                <ChevronRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </main>

            <AccessibilityPanel />
            <AskAI />
        </div>
    );
}

// Helper for relative time
const getRelativeTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (isNaN(diffInSeconds)) return 'Recent';
        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    } catch (e) {
        return 'Recent';
    }
};

function GoalProgress({ label, current, target, color = "from-green-500 to-emerald-500" }: { label: string; current: number; target: number; color?: string }) {
    const percentage = Math.min((current / target) * 100, 100);

    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-bold text-gray-900">{current}/{target}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                    className={`h-full bg-gradient-to-r ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{value}</div>
        </div>
    );
}
