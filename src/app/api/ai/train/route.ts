import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBase } from '@/lib/server/knowledgeBase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Invalid training data' },
                { status: 400 }
            );
        }

        KnowledgeBase.add(text);

        return NextResponse.json({
            success: true,
            message: 'Knowledge base updated successfully',
            count: KnowledgeBase.getAll().length
        });

    } catch (error) {
        console.error('Training Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
