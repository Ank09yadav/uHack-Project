import { NextRequest, NextResponse } from 'next/server';
import { adaptiveTutorService, LearningProfile } from '@/lib/services/adaptiveTutorService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, profile, action } = body as {
            content: string;
            profile: LearningProfile;
            action: 'adapt' | 'tutor-response';
        };

        if (!content || !profile) {
            return NextResponse.json(
                { error: 'Missing required fields: content and profile' },
                { status: 400 }
            );
        }

        if (action === 'adapt') {
            // Adapt content based on profile
            const adapted = await adaptiveTutorService.adaptContent(content, profile);
            return NextResponse.json({
                success: true,
                adapted
            });
        } else if (action === 'tutor-response') {
            // Generate tutor response
            const response = await adaptiveTutorService.generateTutorResponse(content, profile);
            return NextResponse.json({
                success: true,
                response
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "adapt" or "tutor-response"' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Adaptive tutor error:', error);
        return NextResponse.json(
            { error: 'Failed to process adaptive content', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
