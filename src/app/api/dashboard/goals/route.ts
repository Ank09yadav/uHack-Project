import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/lib/models/Goal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { title, target, color } = await req.json();
        await dbConnect();

        const userId = session.user.id;

        const newGoal = await Goal.create({
            userId,
            title,
            target,
            current: 0,
            completed: false,
            color: color || 'blue'
        });

        return NextResponse.json(newGoal);
    } catch (error) {
        console.error("Goal creation error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const goalId = searchParams.get('id');

        if (!goalId) {
            return NextResponse.json({ message: 'Missing goal ID' }, { status: 400 });
        }

        await dbConnect();

        const result = await Goal.deleteOne({ _id: goalId, userId: session.user.id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Goal not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Goal deletion error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, title, target, color, completed } = await req.json();
        if (!id) {
            return NextResponse.json({ message: 'Missing goal ID' }, { status: 400 });
        }

        await dbConnect();
        const User = (await import('@/lib/models/User')).default;
        const Activity = (await import('@/lib/models/Activity')).default;

        const goal = await Goal.findOne({ _id: id, userId: session.user.id });
        if (!goal) {
            return NextResponse.json({ message: 'Goal not found' }, { status: 404 });
        }

        const wasCompleted = goal.completed;

        if (title !== undefined) goal.title = title;
        if (target !== undefined) goal.target = target;
        if (color !== undefined) goal.color = color;
        if (completed !== undefined) goal.completed = completed;

        await goal.save();

        // Award 5 points if goal was just completed
        if (completed && !wasCompleted) {
            const user = await User.findById(session.user.id);
            if (user) {
                user.points = (user.points || 0) + 5;
                await user.save();

                // Log activity for goal completion
                await Activity.create({
                    userId: session.user.id,
                    type: 'achievement',
                    title: `Goal Completed: ${goal.title}`,
                    points: 5
                });
            }
        }

        return NextResponse.json(goal);
    } catch (error) {
        console.error("Goal update error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
