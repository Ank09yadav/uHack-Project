import { NextRequest, NextResponse } from 'next/server';
import { iepGeneratorService, StudentProfile } from '@/lib/services/iepGeneratorService';
import { DisabilityIndicators } from '@/lib/services/disabilityDetectionService';
import { LearningProfile } from '@/lib/services/adaptiveTutorService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { student, disabilityIndicators, learningProfile, action } = body as {
            student: StudentProfile;
            disabilityIndicators: DisabilityIndicators;
            learningProfile: LearningProfile;
            action: 'generate' | 'weekly-plan' | 'export-pdf';
        };

        if (!student) {
            return NextResponse.json(
                { error: 'Missing required field: student' },
                { status: 400 }
            );
        }

        if (action === 'generate') {
            // Generate IEP
            const iep = await iepGeneratorService.generateIEP(
                student,
                disabilityIndicators,
                learningProfile
            );

            return NextResponse.json({
                success: true,
                iep
            });

        } else if (action === 'weekly-plan') {
            const { iep, weekNumber } = body as any;
            const weeklyPlan = iepGeneratorService.generateWeeklyPlan(iep, weekNumber);

            return NextResponse.json({
                success: true,
                weeklyPlan
            });

        } else if (action === 'export-pdf') {
            const { iep } = body as any;
            const pdfData = iepGeneratorService.exportToPDF(iep);

            return NextResponse.json({
                success: true,
                pdfData
            });

        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "generate", "weekly-plan", or "export-pdf"' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('IEP generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate IEP', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
