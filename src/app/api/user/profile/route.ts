import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword, verifyPassword } from '@/lib/password';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, grade, currentPassword, newPassword } = body;

        const db = await connectToDatabase();
        let user;

        if (db) {
            user = await User.findById((session.user as any).id);
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            // Update Name/Grade
            if (name) user.name = name;
            if (grade) user.grade = grade;

            // Password change logic
            if (newPassword && currentPassword) {
                if (!user.password) {
                    return NextResponse.json({ error: 'Social accounts cannot change password here' }, { status: 400 });
                }

                const isCorrect = await verifyPassword(currentPassword, user.password);
                if (!isCorrect) {
                    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
                }

                user.password = await hashPassword(newPassword);
            }

            await user.save();
        } else {
            // Local File Fallback
            const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
            const userIndex = users.findIndex((u: any) => u.id === (session.user as any).id || u._id === (session.user as any).id);

            if (userIndex === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const localUser = users[userIndex];

            if (name) localUser.name = name;
            if (grade) localUser.grade = grade;

            if (newPassword && currentPassword) {
                if (!localUser.password) {
                    return NextResponse.json({ error: 'Social accounts cannot change password here' }, { status: 400 });
                }

                const isCorrect = await verifyPassword(currentPassword, localUser.password);
                if (!isCorrect) {
                    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
                }

                localUser.password = await hashPassword(newPassword);
            }

            localUser.updatedAt = new Date();
            users[userIndex] = localUser;
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error: any) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
