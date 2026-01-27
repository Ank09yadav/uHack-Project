import { NextRequest, NextResponse } from 'next/server';
import { disabilityDetectionService, BehavioralMetrics } from '@/lib/services/disabilityDetectionService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, metrics } = body as { userId: string; metrics: BehavioralMetrics };

        if (!userId || !metrics) {
            return NextResponse.json(
                { error: 'Missing required fields: userId and metrics' },
                { status: 400 }
            );
        }

        // Analyze behavioral metrics
        const result = await disabilityDetectionService.analyzeMetrics(userId, metrics);

        return NextResponse.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('Disability detection error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze behavioral metrics', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId parameter' },
                { status: 400 }
            );
        }

        // Get detection history
        const history = disabilityDetectionService.getDetectionHistory(userId);

        return NextResponse.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('Error fetching detection history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch detection history' },
            { status: 500 }
        );
    }
}
