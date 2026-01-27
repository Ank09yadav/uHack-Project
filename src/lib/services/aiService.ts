export interface AIResponse {
    content: string;
    confidence?: number;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

class AIService {

    async answerQuestion(question: string, history: ChatMessage[] = []): Promise<AIResponse> {
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: history,
                    newMessage: question
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.details || errData.error || response.statusText);
            }

            const data = await response.json();

            return {
                content: data.content,
                confidence: 0.9
            };
        } catch (error: any) {
            console.error("AI Service Error:", error);
            return {
                content: `I'm having trouble connecting to my brain right now. (${error.message || "Unknown error"})`,
                confidence: 0.0
            };
        }
    }

    async trainModel(text: string): Promise<boolean> {
        try {
            const response = await fetch('/api/ai/train', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            return response.ok;
        } catch (error) {
            console.error("Training Error:", error);
            return false;
        }
    }

    async simplifyContent(text: string, level: 'basic' | 'intermediate' | 'advanced' = 'intermediate'): Promise<AIResponse> {
        return {
            content: "Simplification is pending API implementation. (Using mock fallback)",
            confidence: 0.5
        };
    }

    async generateQuiz(content: string, numQuestions: number = 5): Promise<QuizQuestion[]> {
        try {
            const response = await fetch('/api/ai/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: content,
                    difficulty: 'medium', // Default, could be parameterized
                    numQuestions
                })
            });

            if (!response.ok) throw new Error('Failed to generate quiz');

            const data = await response.json();
            return data.questions;
        } catch (error) {
            console.error("Quiz Generation Error:", error);
            return [
                {
                    question: `What is the main concept of: ${content.substring(0, 20)}...?`,
                    options: ['Concept A (Correct)', 'Concept B', 'Concept C', 'Concept D'],
                    correctAnswer: 0,
                    explanation: 'This is a fallback question because the AI service API Key is missing or invalid.',
                    difficulty: 'easy'
                },
                {
                    question: "Which of these is a key benefit of this topic?",
                    options: ['Improved understanding', 'Increased confusion', 'Nothing', 'Something else'],
                    correctAnswer: 0,
                    explanation: 'Understanding is the key benefit.',
                    difficulty: 'easy'
                },
                {
                    question: "True or False: This topic is important.",
                    options: ['True', 'False', 'Maybe', 'I do not know'],
                    correctAnswer: 0,
                    explanation: 'It is important.',
                    difficulty: 'easy'
                }
            ];
        }
    }
}

export const aiService = new AIService();
