"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import {
    Users,
    MessageSquare,
    Share2,
    ShieldCheck,
    Heart,
    Video,
    Plus,
    Search
} from 'lucide-react';

const COMMUNITY_POSTS = [
    {
        id: 1,
        author: "Sarah (Special Educator)",
        type: "tip",
        content: "When teaching the 'Hello' sign, I've found that using a mirror helps children see their own hand positions clearly!",
        likes: 24,
        date: "2h ago"
    },
    {
        id: 2,
        author: "Govind (Parent)",
        type: "achievement",
        content: "My son just completed his first week of the 'SignQuest' game! He can now sign 5 basic words independently. ❤️",
        likes: 56,
        date: "5h ago"
    },
    {
        id: 3,
        author: "NGO: InclusiveIndia",
        type: "resource",
        content: "We've uploaded a new dataset of 50 Indian Sign Language (ISL) gestures for the community to verify!",
        likes: 128,
        date: "1d ago"
    }
];

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-indigo-50 to-white py-20">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                    >
                        <Users size={40} />
                    </motion.div>
                    <h1 className="mb-4 text-4xl font-black text-gray-900 sm:text-6xl">Collective Impact</h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600">
                        Join teachers, parents, and NGOs in building the most inclusive educational community.
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-4 py-12">
                {/* Community Stats */}
                <div className="mb-12 grid gap-6 sm:grid-cols-3 text-center">
                    {[
                        { label: "Community Signs", val: "1.2k+" },
                        { label: "Verified Tips", val: "450+" },
                        { label: "Active Families", val: "8k+" }
                    ].map((stat, i) => (
                        <div key={i} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="text-3xl font-black text-indigo-600">{stat.val}</div>
                            <div className="text-sm font-bold uppercase tracking-wider text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search tips, resources, or stories..."
                            className="w-full rounded-2xl border border-gray-100 bg-white py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Posts */}
                <div className="space-y-6">
                    {COMMUNITY_POSTS.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
                                    <div>
                                        <div className="font-bold text-gray-900">{post.author}</div>
                                        <div className="text-xs text-gray-400">{post.date}</div>
                                    </div>
                                </div>
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                    {post.type}
                                </span>
                            </div>
                            <p className="mb-6 text-lg text-gray-700 leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-6 border-t border-gray-50 pt-4 text-gray-400">
                                <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                                    <Heart size={20} />
                                    <span className="text-sm font-bold">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                                    <MessageSquare size={20} />
                                    <span className="text-sm font-bold text-gray-400">Comment</span>
                                </button>
                                <button className="ml-auto hover:text-gray-900 transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Floating Action Button */}
                <button className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition-all hover:scale-110 active:scale-95">
                    <Plus size={32} />
                </button>
            </main>
        </div>
    );
}
