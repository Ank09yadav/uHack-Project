"use client";

export interface DetectionResult {
    possibleCondition: string;
    confidence: number;
    recommendedMode: 'visual' | 'audio' | 'simplified' | 'standard';
    reason: string;
}

class DetectionService {
    private metrics = {
        readingSpeeds: [] as number[],
        comprehensionScores: [] as number[],
        attentionLossCount: 0,
        moduleStartTime: 0,
        interactionPauses: [] as number[],
    };

    startSession() {
        this.metrics.moduleStartTime = Date.now();
    }

    recordReadingMetric(wordCount: number, timeSpentMs: number) {
        const wpm = (wordCount / (timeSpentMs / 1000)) * 60;
        this.metrics.readingSpeeds.push(wpm);
    }

    recordQuizResult(score: number) {
        this.metrics.comprehensionScores.push(score);
    }

    recordAttentionLoss() {
        this.metrics.attentionLossCount++;
    }

    analyze(): DetectionResult | null {
        const avgWPM = this.metrics.readingSpeeds.length > 0
            ? this.metrics.readingSpeeds.reduce((a, b) => a + b, 0) / this.metrics.readingSpeeds.length
            : 200;

        const avgScore = this.metrics.comprehensionScores.length > 0
            ? this.metrics.comprehensionScores.reduce((a, b) => a + b, 0) / this.metrics.comprehensionScores.length
            : 100;

        // Simple heuristic rules
        if (avgWPM < 100 && avgScore < 70) {
            return {
                possibleCondition: "Processing difficulty / Dyslexia signs",
                confidence: 0.75,
                recommendedMode: 'simplified',
                reason: "User shows slower reading speed and lower comprehension. Simplified content with visual aids might help."
            };
        }

        if (this.metrics.attentionLossCount > 5) {
            return {
                possibleCondition: "ADHD / Attention difficulty",
                confidence: 0.8,
                recommendedMode: 'visual',
                reason: "Frequent focus loss detected. Interactive visual elements and shorter segments recommended."
            };
        }

        return null;
    }

    getRecommendations(condition: string) {
        const recommendations: Record<string, string[]> = {
            "Dyslexia": ["Use Dyslexic-friendly fonts", "Increase line spacing", "Provide audio versions"],
            "ADHD": ["Break content into 5-minute chunks", "Use gamified rewards", "Minimize visual clutter"],
            "Hearing Impairment": ["Provide real-time captions", "Use sign language avatars", "Visual alerts for audio"],
        };
        return recommendations[condition] || [];
    }
}

export const detectionService = new DetectionService();
