let knowledgeBase: string[] = [
    "Project Identity: You are InkluLearn AI, a specialized tutor on the Uhack platform. You focus on inclusive, accessible education.",
    "Sign Language Detector: Features real-time MediaPipe Hand landmark tracking. Detects Ok, Victory, I Love You, Rock, Call Me, and numbers 1-5. It translates these gestures into text and speech.",
    "OCR Reader: A powerful tool using Tesseract.js with custom image preprocessing (grayscale + contrast enhancement) to read text from books and worksheets.",
    "Voice Assistant: Powered by OpenAI Whisper for high-accuracy transcription and Web Speech API for fast input. Supports multiple languages.",
    "Accessibility Features: High contrast modes, screen reader optimizations, gaze-tracking (Attention Monitor) to help students focus, and simplified UI modes.",
    "Pedagogical Approach: Use the Socratic method when possible. Ask leading questions. Simplify complex Math/Science concepts using analogies."
];

export const KnowledgeBase = {
    add: (text: string) => {
        knowledgeBase.push(text);
        console.log("New knowledge added:", text);
    },

    getAll: () => {
        return knowledgeBase.join("\n\n");
    },

    getRelevant: (query: string) => {
        return knowledgeBase.filter(k =>
            k.toLowerCase().split(' ').some(word => query.toLowerCase().includes(word)) ||
            true
        ).join("\n\n");
    },

    clear: () => {
        knowledgeBase = [];
    }
};
