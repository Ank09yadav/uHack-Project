import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { KnowledgeBase } from '@/lib/server/knowledgeBase';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(req: NextRequest) {
    let newMessage = '';
    try {
        const body = await req.json();
        const { messages, newMessage: msg } = body;
        newMessage = msg;

        const context = KnowledgeBase.getAll();

        const systemPrompt = `
You are **InkluLearn AI**, a world-class educational orchestrator and tutor. Your mission is to provide an elite, accessible, and deeply personalized learning experience.

### YOUR CAPABILITIES & KNOWLEDGE:
${context}

### OPERATIONAL GUIDELINES:
1. **Adaptive Communication**: 
   - Use clear headings and bullet points.
2. **Expert Tutor Persona**:
   - Guide the user through the process.
3. **Inclusive Vision**:
   - Proactively suggest using platform features like OCR, Sign Language, and Whisper.
`;

        // ---------------------------------------------------------
        // STRATEGY 1: OpenAI (Client Preference if Key Exists)
        // ---------------------------------------------------------
        if (OPENAI_API_KEY) {
            try {
                const openAIHistory = messages.map((m: any) => ({
                    role: m.role === 'client' || m.role === 'user' ? 'user' : 'assistant',
                    content: m.content
                }));

                // Add system prompt
                openAIHistory.unshift({ role: 'system', content: systemPrompt });
                // Add current message if not in history
                if (openAIHistory[openAIHistory.length - 1].content !== newMessage) {
                    openAIHistory.push({ role: 'user', content: newMessage });
                }

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo', // or gpt-4
                        messages: openAIHistory,
                        max_tokens: 800,
                    })
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API Error: ${response.statusText}`);
                }

                const data = await response.json();
                return NextResponse.json({ content: data.choices[0].message.content });

            } catch (error) {
                console.error("OpenAI failed, falling back to Gemini...", error);
            }
        }


        // ---------------------------------------------------------
        // STRATEGY 2: Google Gemini (Fallback)
        // ---------------------------------------------------------
        if (GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const validHistory = messages.filter((m: any, index: number) => {
                if (index === 0 && (m.role === 'assistant' || m.role === 'model')) return false;
                return true;
            }).map((m: any) => ({
                role: m.role === 'client' || m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            const chat = model.startChat({
                history: validHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            const finalPrompt = `${systemPrompt}\n\nUser Question: ${newMessage}`;
            const result = await chat.sendMessage(finalPrompt);
            const response = await result.response;
            const text = response.text();

            return NextResponse.json({ content: text });
        }


        // ---------------------------------------------------------
        // STRATEGY 3: Local Fallback (No Keys)
        // ---------------------------------------------------------
        throw new Error("No API Keys configured for AI.");

    } catch (error: any) {
        console.error('AI Error detailed:', error);

        const errorMessage = error?.message || String(error);

        console.warn("API Error. Using local intelligent tutor logic.");

        let response = "";
        const lowerMsg = newMessage.toLowerCase();

        if (lowerMsg.includes("hindi") || lowerMsg.includes("translate")) {
            response = "नमस्ते! मैं आपकी मदद कर सकता हूँ। आप सेटिंग्स में जाकर 'Hindi' चुन सकते हैं ताकि पूरा ऐप हिंदी में दिखाई दे।";
        } else if (lowerMsg.includes("sign") || lowerMsg.includes("gesture")) {
            response = "Our Sign Language tool is very powerful! It uses computer vision to recognize hand signs like 'Ok', 'Victory', and 'I Love You' in real-time.";
        } else if (lowerMsg.includes("ocr") || lowerMsg.includes("scan") || lowerMsg.includes("read")) {
            response = "The OCR Reader helps you scan text from images. It's specially designed with high contrast to assist students with visual impairments.";
        } else {
            response = "I'm currently in 'Optimized Mode' because of missing API keys, but I'm still here to help! I can answer questions about Sign Language, OCR, and inclusive learning features of this platform.";
        }

        return NextResponse.json({ content: response });
    }
}
