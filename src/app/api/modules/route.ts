
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/lib/models/Module';

const sampleModules = [
    {
        id: 'sign-language',
        title: 'Sign Language Basics (AI Powered)',
        description: 'Practice basic sign language gestures with our real-time AI detector.',
        content: `Connect your camera to start practicing.\n\nSupported gestures: 'Open Hand', 'Fist', 'Peace/V', 'Thumbs Up', 'ILoveYou', 'Rock'.`,
        duration: 10,
        difficulty: 'beginner',
        category: 'Communication',
    },
    {
        id: '1',
        title: 'Introduction to Accessible Learning',
        description: 'Learn the fundamentals of inclusive education and how technology can help everyone learn better.',
        content: `Accessible learning is about creating educational experiences that work for everyone, regardless of their abilities or disabilities. This includes using tools like text-to-speech for users who have difficulty reading, speech-to-text for those who struggle with typing, and adaptive content that adjusts to each learner's pace and style.\n\nKey principles of accessible learning include:\n1. Multiple means of representation - presenting information in different ways\n2. Multiple means of action and expression - allowing users to demonstrate learning differently\n3. Multiple means of engagement - offering various ways to motivate and engage learners\n\nTechnology plays a crucial role in making education more accessible. AI-powered tools can adapt content difficulty, provide personalized explanations, and offer real-time assistance to users with diverse learning needs.`,
        duration: 15,
        difficulty: 'beginner',
        category: 'Accessibility',
    },
    {
        id: '2',
        title: 'Using AI for Personalized Learning',
        description: 'Discover how artificial intelligence can adapt to your learning style and help you succeed.',
        content: `Artificial Intelligence is revolutionizing education by providing personalized learning experiences. AI can analyze your learning patterns, identify areas where you need more help, and adjust the difficulty of content accordingly.\n\nBenefits of AI in education:\n- Personalized pace: Learn at your own speed without feeling rushed or held back\n- Adaptive difficulty: Content automatically adjusts to your skill level\n- Instant feedback: Get immediate responses to questions and corrections\n- 24/7 availability: Access help whenever you need it\n\nAI assistants can explain complex concepts in simpler terms, generate practice questions, and provide encouragement when you're struggling. This technology makes learning more accessible and effective for users with diverse needs.`,
        duration: 20,
        difficulty: 'intermediate',
        category: 'AI & Technology',
    },
    {
        id: '3',
        title: 'Effective Study Strategies',
        description: 'Master proven techniques to improve retention, focus, and learning outcomes.',
        content: `Effective studying is not about spending more time with books, but about using the right strategies. Research shows that certain techniques significantly improve learning outcomes.\n\nProven study strategies:\n1. Spaced repetition: Review material at increasing intervals\n2. Active recall: Test yourself instead of just re-reading\n3. Interleaving: Mix different topics instead of blocking by subject\n4. Elaboration: Explain concepts in your own words\n5. Dual coding: Combine words with visuals\n\nFor users with learning differences, these strategies can be enhanced with technology. Use text-to-speech to hear content, speech-to-text to capture thoughts quickly, and AI tools to generate practice questions and explanations.`,
        duration: 25,
        difficulty: 'intermediate',
        category: 'Study Skills',
    },
    {
        id: '4',
        title: 'Advanced Mathematics: Calculus',
        description: 'Introduction to limits, derivatives, and integrals.',
        content: 'Calculus is the mathematical study of continuous change. \n\n Limits: The value that a function approaches as the input approaches some value. \n Derivatives: Measure of how a function changes as its input changes. \n Integrals: Assign numbers to functions in a way that describes displacement, area, volume, and other concepts that arise by combining infinitesimal data. ',
        duration: 45,
        difficulty: 'advanced',
        category: 'Mathematics'
    },
    {
        id: 'ocr-reader',
        title: 'Smart Text Reader (OCR)',
        description: 'Convert images of text into digital text with built-in accessibility analysis.',
        content: 'Upload any image containing text (documents, book pages, handwritten notes). Our AI will extract the text for you to read, listen to, or copy. It also checks the image for visual accessibility issues to ensure high contrast and readability.',
        duration: 5,
        difficulty: 'beginner',
        category: 'Tools'
    }
];

export async function GET() {
    try {
        await dbConnect();

        let modules = await Module.find({});

        if (modules.length === 0) {
            console.log("Seeding modules...");
            try {
                modules = await Module.insertMany(sampleModules);
            } catch (seedError) {
                console.warn("Seeding failed, using raw samples", seedError);
                modules = sampleModules as any;
            }
        }

        return NextResponse.json(modules);
    } catch (error) {
        console.warn("Failed to fetch modules from DB, using mock data:", error);
        return NextResponse.json(sampleModules);
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const newModule = await Module.create(body);

        return NextResponse.json(newModule, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
    }
}
