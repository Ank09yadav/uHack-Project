
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// Mock database
const MOCK_USER_STATS = {
    totalPoints: 1250,
    level: 3,
    streak: 5,
    achievements: [
        {
            id: 'first_module',
            name: 'First Steps',
            description: 'Complete your first learning module',
            icon: '🎯',
            points: 50,
            unlockedAt: '2024-12-01'
        },
        {
            id: 'week_streak',
            name: 'Dedicated Learner',
            description: 'Maintain a 7-day learning streak',
            icon: '🔥',
            points: 150,
            unlockedAt: '2024-12-03'
        }
    ],
    modulesCompleted: 3,
    totalTimeSpent: 125
};

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // In real app, use session. For demo, get the first user
        const user = await User.findOne({ role: 'user' });

        if (!user) {
            return NextResponse.json(MOCK_USER_STATS);
        }

        return NextResponse.json({
            totalPoints: user.points || 0,
            level: Math.floor((user.points || 0) / 500) + 1,
            streak: user.streak || 0,
            achievements: MOCK_USER_STATS.achievements, // Need Achievement Model for dynamic list, fallback for now
            modulesCompleted: user.completedModules?.length || 0,
            totalTimeSpent: 125 // Need to track this in User model, fallback for now
        });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(MOCK_USER_STATS);
    }
}
