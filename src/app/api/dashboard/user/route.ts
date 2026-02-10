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

        // 2. Fetch Goals - Seed if empty
        let goals = await Goal.find({ userId });
        if (goals.length === 0) {
            const defaultGoals = [
                { userId, title: 'Daily Streak', current: user.streak || 0, target: 7, color: 'purple' },
                { userId, title: 'Learn 5 Modules', current: user.completedModules?.length || 0, target: 5, color: 'blue' },
                { userId, title: 'Study Time', current: user.totalTimeSpent || 0, target: 120, color: 'green' }
            ];
            await Goal.insertMany(defaultGoals);
            goals = await Goal.find({ userId });
        }

        // 3. Fetch Recent Activity - Seed if empty
        let activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(5);
        if (activities.length === 0) {
            const welcomeActivity = {
                userId,
                type: 'achievement',
                title: 'Joined InkluLearn!',
                points: 50
            };
            await Activity.create(welcomeActivity);

            // Add initial points to user
            user.points = (user.points || 0) + 50;
            await user.save();

            activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(5);
        }

        // 4. Fetch Recommended Modules (Randomize each time using $sample)
        const recommendedModules = await Module.aggregate([{ $sample: { size: 3 } }]);

        // 5. Construct Response
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekActivities = await Activity.find({ userId, createdAt: { $gte: lastWeek } });

        const thisWeekStats = {
            modules: thisWeekActivities.filter(a => a.type === 'module').length,
            time: thisWeekActivities.reduce((acc, a) => acc + (a.meta?.duration || 0), 0),
            points: thisWeekActivities.reduce((acc, a) => acc + (a.points || 0), 0)
        };

        return NextResponse.json({
            user: {
                name: user.name,
                points: user.points || 0,
                streak: user.streak || 0,
                level: Math.floor((user.points || 0) / 200) + 1,
                achievements: user.achievements || [],
                modulesCompleted: user.completedModules?.length || 0,
                totalTimeSpent: user.totalTimeSpent || 0
            },
            goals: goals,
            activities: activities,
            recommendedModules: recommendedModules.length > 0 ? recommendedModules : MOCK_USER_DATA.recommendedModules,
            thisWeek: thisWeekStats
        });

    } catch (error) {
        console.warn("Database Error", error);
        // In a real app we might return 500, but ensuring the frontend doesn't crash:
        return NextResponse.json(MOCK_USER_DATA);
    }
}
