"use client";

import React, { useState, useEffect } from 'react';
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
    Search,
    ThumbsUp,
    ThumbsDown,
    Edit2,
    Trash2,
    X as CloseIcon
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

export default function CommunityPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState<'tip' | 'achievement' | 'resource' | 'story'>('tip');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth');
        } else if (status === 'authenticated') {
            fetchPosts();
        }
    }, [status]);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/community');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (postId: string, action: 'upvote' | 'downvote') => {
        try {
            const res = await fetch('/api/community/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, action })
            });
            if (res.ok) {
                const updatedPost = await res.json();
                setPosts(posts.map(p => p._id === postId ? updatedPost : p));
            }
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingPost ? 'PATCH' : 'POST';
            const body = editingPost
                ? JSON.stringify({ id: editingPost._id, content: newPostContent, type: newPostType })
                : JSON.stringify({ content: newPostContent, type: newPostType });

            const res = await fetch('/api/community', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body
            });

            if (res.ok) {
                const savedPost = await res.json();
                if (editingPost) {
                    setPosts(posts.map(p => p._id === editingPost._id ? savedPost : p));
                } else {
                    setPosts([savedPost, ...posts]);
                }
                setIsModalOpen(false);
                setEditingPost(null);
                setNewPostContent('');
            }
        } catch (error) {
            console.error("Error saving post:", error);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            const res = await fetch(`/api/community?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts(posts.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-gray-100 bg-white py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading collective wisdom...</div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                                            {post.authorName?.[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{post.authorName}</div>
                                            <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                            {post.type}
                                        </span>
                                        {session?.user?.id === post.userId && (
                                            <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingPost(post);
                                                        setNewPostContent(post.content);
                                                        setNewPostType(post.type);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="mb-6 text-lg text-gray-700 leading-relaxed">{post.content}</p>
                                <div className="flex items-center gap-6 border-t border-gray-50 pt-4 text-gray-400">
                                    <div className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5">
                                        <button
                                            onClick={() => handleVote(post._id, 'upvote')}
                                            className={`hover:text-indigo-600 transition-colors ${post.upvotes?.includes(session?.user?.id) ? 'text-indigo-600' : ''}`}
                                        >
                                            <ThumbsUp size={18} />
                                        </button>
                                        <span className="text-sm font-bold min-w-[20px] text-center">
                                            {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
                                        </span>
                                        <button
                                            onClick={() => handleVote(post._id, 'downvote')}
                                            className={`hover:text-red-500 transition-colors ${post.downvotes?.includes(session?.user?.id) ? 'text-red-500' : ''}`}
                                        >
                                            <ThumbsDown size={18} />
                                        </button>
                                    </div>
                                    <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                                        <MessageSquare size={18} />
                                        <span className="text-sm font-bold">Comment</span>
                                    </button>
                                    <button className="ml-auto hover:text-gray-900 transition-colors">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-500">No collective impact found yet. Be the first to share!</div>
                    )}
                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                                onClick={() => setIsModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900">{editingPost ? 'Edit Impact' : 'Share Your Impact'}</h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <CloseIcon size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmitPost} className="space-y-4">
                                    <div className="flex gap-2">
                                        {['tip', 'achievement', 'resource', 'story'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewPostType(type as any)}
                                                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${newPostType === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        required
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="What's on your mind? Tips, achievements, or resources..."
                                        className="h-40 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]"
                                    >
                                        {editingPost ? 'Update Story' : 'Post to Community'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Floating Action Button */}
                <button
                    onClick={() => {
                        setEditingPost(null);
                        setNewPostContent('');
                        setIsModalOpen(true);
                    }}
                    className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 z-40"
                >
                    <Plus size={32} />
                </button>
            </main>
        </div>
    );
}
