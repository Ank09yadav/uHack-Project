import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Goal from '@/lib/models/Goal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { timeIncrement, activity } = await req.json();
        await dbConnect();

        const userId = session.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const lastActive = user.lastActive ? new Date(user.lastActive) : null;

        // 1. Update Streak logic
        if (lastActive) {
            const diffInDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
            if (diffInDays === 1) {
                user.streak = (user.streak || 0) + 1;
            } else if (diffInDays > 1) {
                user.streak = 1;
            }
        } else {
            user.streak = 1;
        }
        user.lastActive = now;

        // 2. Update Time Spent
        if (timeIncrement) {
            user.totalTimeSpent = (user.totalTimeSpent || 0) + Number(timeIncrement);

            // Update Study Time Goal
            await Goal.updateOne(
                { userId, title: 'Study Time' },
                { $inc: { current: Number(timeIncrement) } }
            );

            // Log/Update Daily Study Activity for "This Week" stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await Activity.findOneAndUpdate(
                {
                    userId,
                    type: 'module',
                    title: 'Daily Study Session',
                    createdAt: { $gte: today }
                },
                {
                    $inc: { 'meta.duration': Number(timeIncrement) },
                    $set: { updatedAt: new Date() }
                },
                { upsert: true, new: true }
            );
        }

        // 3. Log Activity
        if (activity) {
            await Activity.create({
                userId,
                type: activity.type,
                title: activity.title,
                points: activity.points || 0,
                meta: activity.meta
            });

            if (activity.points) {
                user.points = (user.points || 0) + activity.points;
            }

            // Update Module Completion Goal
            if (activity.type === 'module') {
                await Goal.updateOne(
                    { userId, title: 'Learn 5 Modules' },
                    { $inc: { current: 1 } }
                );
            }
        }

        await user.save();

        return NextResponse.json({
            success: true,
            streak: user.streak,
            totalTimeSpent: user.totalTimeSpent,
            points: user.points
        });

    } catch (error) {
        console.error("Tracking Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
