"use client";

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export function RealtimeTracker() {
    const { status } = useSession();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            // Ping every 1 minute
            intervalRef.current = setInterval(async () => {
                try {
                    await fetch('/api/dashboard/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ timeIncrement: 1 })
                    });
                } catch (error) {
                    console.warn("Silent tracking failure", error);
                }
            }, 60000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [status]);

    return null; // Invisible component
}
