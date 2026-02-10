"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, Home, Users, Settings, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Derived from session
    const user = session?.user;

    const navItems = [
        { href: '/', label: t('nav.home'), icon: <Home size={18} /> },
        { href: '/learn', label: t('nav.learn'), icon: <BookOpen size={18} />, roles: ['user', 'teacher', 'admin'] },
        { href: '/dashboard', label: t('nav.dashboard'), icon: <Users size={18} />, roles: ['user', 'admin'] },
        { href: '/community', label: t('nav.community'), icon: <Users size={18} />, roles: ['user', 'teacher', 'admin'] },
        { href: '/teacher', label: t('nav.teacher'), icon: <Users size={18} />, roles: ['teacher', 'admin'] },
    ];

    const filteredItems = navItems.filter(item =>
        !item.roles || (user && item.roles.includes((user as any).role))
    );

    return (
        <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-gray-900 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg transition-transform group-hover:scale-105">
                            <BookOpen size={24} strokeWidth={2.5} />
                        </div>
                        <span className="font-extrabold tracking-tight">EduAccess</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-2 md:flex">
                        {filteredItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100/50 hover:text-gray-900 active:scale-95"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        <div className="ml-4 flex items-center gap-2 pl-4 border-l border-gray-200">
                            {user ? (
                                <div className="group relative flex items-center gap-2 py-2">
                                    <div className="flex cursor-pointer items-center gap-3 rounded-full border border-gray-100 bg-white p-1 pr-4 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                                            {presentationName(user.name)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                                            <ChevronDown size={14} className="text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                                        <div className="w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                                            <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Account</p>
                                                <p className="mt-1 truncate text-sm font-medium text-gray-900">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600">
                                                    <User size={18} />
                                                    My Profile
                                                </Link>
                                                <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-600">
                                                    <Settings size={18} />
                                                    Settings
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-100 p-2">
                                                <button
                                                    onClick={() => signOut({ callbackUrl: '/' })}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                    <LogOut size={18} />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link href="/auth" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Log In</Link>
                                    <Link href="/auth?m=register" className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 bg-white md:hidden"
                    >
                        <div className="space-y-1 px-4 py-3">
                            {filteredItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                            {!user && (
                                <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-gray-100">
                                    <Link href="/auth" className="block w-full text-center py-2 text-sm font-semibold text-gray-600">Log In</Link>
                                    <Link href="/auth?m=register" className="block w-full text-center py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold">Get Started</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

function presentationName(name?: string | null) {
    return name?.charAt(0) || 'U';
}
