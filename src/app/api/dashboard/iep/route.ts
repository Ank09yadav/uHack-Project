import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Goal from '@/lib/models/Goal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = session.user.id;

        const user = await User.findById(userId);
        const activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(10);
        const goals = await Goal.find({ userId });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Logic to generate dynamic IEP data
        const strengths = [
            (user.totalTimeSpent || 0) > 60 ? "Dedicated learning consistency" : "Core learning engagement",
            activities.some(a => a.type === 'module') ? "Active module participation" : "Initial platform exploration",
            "Continuous progress tracking"
        ];

        const weaknesses = [
            goals.filter(g => !g.completed).length > 2 ? "Goal completion regularity" : "New goal diversification",
            "Extended focus sessions",
            "Multi-tool integration"
        ];

        const shortTermGoals = goals.filter(g => !g.completed).map(g => `Complete "${g.title}" goal`);
        if (shortTermGoals.length === 0) shortTermGoals.push("Set 3 new learning objectives");

        const iepData = {
            studentName: user.name || "Student",
            strengths: strengths,
            weaknesses: weaknesses,
            learningStyle: (user.totalTimeSpent || 0) > 30 ? "Visual-Spatial" : "Auditory-Sequential",
            accommodations: [
                "Extended time for assignments",
                "Frequent breaks during focus sessions",
                "Visual checklists for multi-step tasks",
                "Text-to-speech for long-form content"
            ],
            goals: {
                shortTerm: shortTermGoals,
                longTerm: [
                    "Achieve Level 10 proficiency",
                    "Complete all core learning modules",
                    "Master adaptive tool usage"
                ]
            },
            recommendedTools: ["AI Tutor", "Accessibility Panel", "Progress Tracker"],
            progressScore: Math.min(Math.floor((user.points || 0) / 10), 100),
            accessibilityTips: [
                "Use the Accessibility Panel (Ctrl+1) to enable high contrast modes.",
                "The Sign Language Detector helps practice gestural communication.",
                "Custom screen reader optimization is active for your profile.",
                "Visit the Community Hub to connect with other inclusive learners."
            ],
            promotionalMessage: "InclusiveEdu: Empowering every learner through AI-driven accessibility. Join the movement at localhost:3000.",
            timeline: [
                { date: "Month 1", milestone: "Platform Orientation" },
                { date: "Month 2", milestone: "Core Skills Development" },
                { date: "Month 3", milestone: "Advanced Adaptive Mastery" }
            ]
        };

        return NextResponse.json(iepData);
    } catch (error) {
        console.error("IEP generation error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
