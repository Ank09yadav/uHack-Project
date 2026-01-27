"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudOff, Cloud, RefreshCw, Database as DbIcon } from 'lucide-react';
import { getSyncStatus } from '@/lib/offline/db';

export const SyncStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    useEffect(() => {
        setIsOnline(getSyncStatus());
        const handleStatus = () => setIsOnline(window.navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);

        if (window.navigator.onLine) setLastSync(new Date());

        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);

    return (
        <div className="fixed top-24 right-4 z-[45]">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 rounded-2xl p-3 shadow-xl backdrop-blur-md border ${isOnline ? 'bg-white/80 border-gray-100' : 'bg-orange-50/90 border-orange-100'
                    }`}
            >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isOnline ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    {isOnline ? <Cloud size={20} /> : <CloudOff size={20} />}
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {isOnline ? 'Edge AI Online' : 'Offline Mode Active'}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                        {isOnline ? `Last sync: ${lastSync?.toLocaleTimeString()}` : 'Using local AI models and cache'}
                    </span>
                </div>

                {isOnline && (
                    <div className="ml-2 flex h-8 w-8 items-center justify-center text-gray-400">
                        <RefreshCw size={14} className="hover:animate-spin cursor-pointer" />
                    </div>
                )}
            </motion.div>
        </div>
    );
};
