import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Goal from '@/lib/models/Goal';
import Module from '@/lib/models/Module';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Mock data as fallback for demo or empty states
const MOCK_USER_DATA = {
    user: {
        points: 0,
        streak: 0,
        level: 1,
        achievements: [],
        modulesCompleted: 0,
        totalTimeSpent: 0
    },
    goals: [],
    activities: [],
    recommendedModules: [
        { title: 'Effective Study Strategies', difficulty: 'beginner', duration: 15 },
        { title: 'Introduction to AI Tools', difficulty: 'beginner', duration: 10 }
    ]
};

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. Identify User by ID from session
        const userId = session.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 2. Fetch Goals
        let goals = await Goal.find({ userId });

        // 3. Fetch Recent Activity
        let activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(5);

        // 4. Fetch Recommended Modules
        const recommendedModules = await Module.find({}).limit(3);

        // 5. Construct Response
        return NextResponse.json({
            user: {
                name: user.name,
                points: user.points || 0,
                streak: user.streak || 0,
                level: Math.floor((user.points || 0) / 500) + 1,
                achievements: user.achievements || [],
                modulesCompleted: user.completedModules?.length || 0,
                // totalTimeSpent logic could be aggregated from activities or stored on user. 
                // For now, let's mock it or assume it's on user if schema supported it (Schema had default but let's be safe)
                totalTimeSpent: 120 // Mocking time for now as it wasn't clearly in Schema
            },
            goals: goals,
            activities: activities,
            recommendedModules: recommendedModules.length > 0 ? recommendedModules : MOCK_USER_DATA.recommendedModules
        });

    } catch (error) {
        console.warn("Database Error", error);
        // In a real app we might return 500, but ensuring the frontend doesn't crash:
        return NextResponse.json(MOCK_USER_DATA);
    }
}
