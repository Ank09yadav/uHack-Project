import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, difficulty, numQuestions } = body;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
        Generate a quiz about "${topic}".
        Difficulty: ${difficulty}.
        Number of questions: ${numQuestions}.
        
        Return ONLY a JSON array of objects with this structure:
        [
            {
                "question": "Question text here",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0, // index of correct option (0-3)
                "explanation": "Explanation of why this is correct",
                "difficulty": "easy" | "medium" | "hard"
            }
        ]
        Do not include markdown formatting or backticks. Just the raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it despite instructions
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const quizData = JSON.parse(cleanText);

        return NextResponse.json({ questions: quizData });

    } catch (error) {
        console.error('Quiz Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz', details: String(error) },
            { status: 500 }
        );
    }
}
