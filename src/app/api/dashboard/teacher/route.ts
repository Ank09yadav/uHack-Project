import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

// Mock data as fallback
const mockTeacherData = {
    students: [
        { id: 's1', name: 'Alex Johnson', progress: 75, modules: 5, lastActive: '2 hours ago', status: 'active' },
        { id: 's2', name: 'Emma Davis', progress: 92, modules: 7, lastActive: '1 day ago', status: 'active' },
        { id: 's3', name: 'Michael Chen', progress: 45, modules: 3, lastActive: '3 days ago', status: 'inactive' },
        { id: 's4', name: 'Sarah Williams', progress: 88, modules: 6, lastActive: '5 hours ago', status: 'active' },
        { id: 's5', name: 'James Brown', progress: 60, modules: 4, lastActive: '1 day ago', status: 'active' },
    ],
    recentActivity: [
        { student: 'Emma Davis', action: 'Completed "AI Learning" module', time: '1 hour ago', type: 'success' },
        { student: 'Alex Johnson', action: 'Scored 95% on quiz', time: '2 hours ago', type: 'success' },
        { student: 'Michael Chen', action: 'Needs help with "Study Strategies"', time: '1 day ago', type: 'warning' },
        { student: 'Sarah Williams', action: 'Unlocked "Dedicated Learner" badge', time: '3 hours ago', type: 'success' },
    ],
    upcomingAssignments: [
        { title: 'Chapter 3 Quiz', dueDate: 'Tomorrow', students: 15 },
        { title: 'Accessibility Module', dueDate: 'Dec 10', students: 20 },
        { title: 'Final Assessment', dueDate: 'Dec 15', students: 18 },
    ]
};

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // In a real scenario, we would get the logged-in teacher's ID from the session
        // const session = await getServerSession(authOptions);
        // const teacherId = session?.user?.id;

        // For now, fetch all students (demo mode)
        const students = await User.find({ role: 'user' }).select('name email progress points updatedAt');

        if (students.length === 0) {
            console.log("No students found in DB, returning mock data.");
            return NextResponse.json(mockTeacherData);
        }

        const formattedStudents = students.map(s => ({
            id: s._id.toString(),
            name: s.name,
            progress: s.progress || 0,
            modules: s.completedModules?.length || 0,
            lastActive: new Date(s.updatedAt).toLocaleDateString(), // Simplified for now
            status: 'active' // Default for now
        }));

        return NextResponse.json({
            ...mockTeacherData, // Keep mock activities/assignments for now until those models exist
            students: formattedStudents
        });

    } catch (error) {
        console.warn("Database connection failed or missing MONGODB_URI. Using mock data.", error);
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        return NextResponse.json(mockTeacherData);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, initialProgress } = body;

        try {
            await connectToDatabase();
            // Create user in DB
            const newUser = await User.create({
                name,
                email,
                role: 'user',
                progress: initialProgress || 0,
                password: 'password123', // Default password for demo
            });

            return NextResponse.json({
                success: true,
                student: {
                    id: newUser._id.toString(),
                    name: newUser.name,
                    progress: newUser.progress,
                    modules: 0,
                    lastActive: 'Just now',
                    status: 'active'
                }
            });
        } catch (dbError) {
            console.warn("DB write failed, falling back to mock response", dbError);
            // Fallback mock response
            return NextResponse.json({
                success: true,
                student: {
                    id: `temp_${Date.now()}`,
                    name,
                    progress: initialProgress || 0,
                    modules: 0,
                    lastActive: 'Just now',
                    status: 'active'
                }
            });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
    }
}
