"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, Zap, TrendingUp } from 'lucide-react';
import { UserStats, Achievement } from '@/lib/services/gamificationService';

interface ProgressTrackerProps {
    stats: UserStats;
    className?: string;
}

export function ProgressTracker({ stats, className = "" }: ProgressTrackerProps) {
    const progressToNextLevel = ((stats.totalPoints % 200) / 200) * 100;

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="mb-1 text-sm opacity-90">Current Level</div>
                        <div className="text-4xl font-bold">Level {stats.level}</div>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                        <Trophy size={32} />
                    </div>
                </div>

                <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{stats.totalPoints} points</span>
                    <span>{200 - (stats.totalPoints % 200)} to next level</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextLevel}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<Star className="text-yellow-500" size={24} />}
                    label="Modules Completed"
                    value={stats.modulesCompleted}
                    color="yellow"
                />
                <StatCard
                    icon={<Zap className="text-orange-500" size={24} />}
                    label="Current Streak"
                    value={`${stats.streak} days`}
                    color="orange"
                />
                <StatCard
                    icon={<Award className="text-purple-500" size={24} />}
                    label="Achievements"
                    value={stats.achievements.length}
                    color="purple"
                />
                <StatCard
                    icon={<TrendingUp className="text-green-500" size={24} />}
                    label="Time Spent"
                    value={`${Math.floor(stats.totalTimeSpent / 60)}h ${stats.totalTimeSpent % 60}m`}
                    color="green"
                />
            </div>

            {stats.achievements.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Award className="text-purple-500" size={24} />
                        Recent Achievements
                    </h3>
                    <div className="space-y-3">
                        {stats.achievements.slice(-3).reverse().map((achievement, index) => (
                            <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="mb-2 flex items-center justify-between">
                {icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
        </motion.div>
    );
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4"
        >
            <div className="text-4xl">{achievement.icon}</div>
            <div className="flex-1">
                <div className="font-semibold text-gray-900">{achievement.name}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
            </div>
            <div className="text-right">
                <div className="text-lg font-bold text-purple-600">+{achievement.points}</div>
                <div className="text-xs text-gray-500">points</div>
            </div>
        </motion.div>
    );
}
