/**
 * AI Learning Disability Detection Service
 * Analyzes behavioral patterns to detect early signs of learning disabilities
 * VERY HIGH IMPACT FEATURE
 */

export interface BehavioralMetrics {
    readingSpeed: number; // words per minute
    speechPauses: number; // pauses per minute
    gestureConfusion: number; // 0-1 score
    answerAccuracy: number; // 0-1 score
    responseTime: number; // milliseconds
    attentionSpan: number; // seconds
    errorPatterns: string[];
}

export interface DisabilityIndicators {
    dyslexia: number; // 0-1 probability
    adhd: number; // 0-1 probability
    speechDelay: number; // 0-1 probability
    hearingIssues: number; // 0-1 probability
    visualProcessing: number; // 0-1 probability
    overall: number; // 0-1 combined score
}

export interface DetectionResult {
    detected: boolean;
    confidence: number;
    indicators: DisabilityIndicators;
    recommendations: string[];
    adaptiveMode: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    timestamp: Date;
}

export interface LearningSession {
    userId: string;
    sessionId: string;
    duration: number;
    metrics: BehavioralMetrics;
    timestamp: Date;
}

class DisabilityDetectionService {
    private sessionHistory: Map<string, LearningSession[]> = new Map();
    private readonly DETECTION_THRESHOLD = 0.6;
    private readonly MIN_SESSIONS_FOR_DETECTION = 3;

    /**
     * Analyze behavioral metrics to detect learning disabilities
     */
    async analyzeMetrics(userId: string, metrics: BehavioralMetrics): Promise<DetectionResult> {
        // Store session data
        this.addSession(userId, metrics);

        // Calculate indicators
        const indicators = this.calculateIndicators(metrics);

        // Get historical trend
        const trend = this.analyzeTrend(userId);

        // Combine current and historical data
        const combinedIndicators = this.combineIndicators(indicators, trend);

        // Determine if detection threshold is met
        const detected = combinedIndicators.overall >= this.DETECTION_THRESHOLD;

        // Generate recommendations
        const recommendations = this.generateRecommendations(combinedIndicators);

        // Suggest adaptive mode
        const adaptiveMode = this.suggestAdaptiveMode(combinedIndicators);

        return {
            detected,
            confidence: combinedIndicators.overall,
            indicators: combinedIndicators,
            recommendations,
            adaptiveMode,
            timestamp: new Date()
        };
    }

    /**
     * Calculate disability indicators from metrics
     */
    private calculateIndicators(metrics: BehavioralMetrics): DisabilityIndicators {
        // Dyslexia indicators
        const dyslexiaScore = this.calculateDyslexiaScore(metrics);

        // ADHD indicators
        const adhdScore = this.calculateADHDScore(metrics);

        // Speech delay indicators
        const speechScore = this.calculateSpeechScore(metrics);

        // Hearing issues indicators
        const hearingScore = this.calculateHearingScore(metrics);

        // Visual processing indicators
        const visualScore = this.calculateVisualScore(metrics);

        // Overall score (weighted average)
        const overall = (
            dyslexiaScore * 0.25 +
            adhdScore * 0.25 +
            speechScore * 0.2 +
            hearingScore * 0.15 +
            visualScore * 0.15
        );

        return {
            dyslexia: dyslexiaScore,
            adhd: adhdScore,
            speechDelay: speechScore,
            hearingIssues: hearingScore,
            visualProcessing: visualScore,
            overall
        };
    }

    /**
     * Calculate dyslexia probability
     * Indicators: slow reading, letter confusion, pattern errors
     */
    private calculateDyslexiaScore(metrics: BehavioralMetrics): number {
        let score = 0;

        // Slow reading speed (< 100 wpm is concerning)
        if (metrics.readingSpeed < 100) {
            score += 0.4;
        } else if (metrics.readingSpeed < 150) {
            score += 0.2;
        }

        // Letter reversal patterns
        const reversalPatterns = ['b-d', 'p-q', 'was-saw'];
        const hasReversals = metrics.errorPatterns.some(pattern =>
            reversalPatterns.some(rp => pattern.includes(rp))
        );
        if (hasReversals) score += 0.3;

        // Low answer accuracy with reading tasks
        if (metrics.answerAccuracy < 0.5) {
            score += 0.3;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Calculate ADHD probability
     * Indicators: short attention span, impulsive answers, inconsistent performance
     */
    private calculateADHDScore(metrics: BehavioralMetrics): number {
        let score = 0;

        // Short attention span (< 5 minutes is concerning)
        if (metrics.attentionSpan < 300) {
            score += 0.4;
        } else if (metrics.attentionSpan < 600) {
            score += 0.2;
        }

        // Very fast response times (impulsivity)
        if (metrics.responseTime < 1000) {
            score += 0.3;
        }

        // Inconsistent accuracy
        if (metrics.answerAccuracy > 0.3 && metrics.answerAccuracy < 0.7) {
            score += 0.3;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Calculate speech delay probability
     * Indicators: frequent pauses, slow responses, pronunciation errors
     */
    private calculateSpeechScore(metrics: BehavioralMetrics): number {
        let score = 0;

        // Frequent speech pauses (> 10 per minute)
        if (metrics.speechPauses > 10) {
            score += 0.5;
        } else if (metrics.speechPauses > 5) {
            score += 0.3;
        }

        // Slow response time
        if (metrics.responseTime > 5000) {
            score += 0.3;
        }

        // Speech-related error patterns
        const speechErrors = metrics.errorPatterns.filter(p =>
            p.includes('pronunciation') || p.includes('speech')
        );
        if (speechErrors.length > 0) {
            score += 0.2;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Calculate hearing comprehension issues probability
     */
    private calculateHearingScore(metrics: BehavioralMetrics): number {
        let score = 0;

        // Gesture confusion (difficulty understanding verbal instructions)
        if (metrics.gestureConfusion > 0.6) {
            score += 0.5;
        } else if (metrics.gestureConfusion > 0.4) {
            score += 0.3;
        }

        // Low accuracy on audio-based tasks
        const audioErrors = metrics.errorPatterns.filter(p =>
            p.includes('audio') || p.includes('listening')
        );
        if (audioErrors.length > 2) {
            score += 0.5;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Calculate visual processing issues probability
     */
    private calculateVisualScore(metrics: BehavioralMetrics): number {
        let score = 0;

        // Gesture confusion (difficulty with visual cues)
        if (metrics.gestureConfusion > 0.7) {
            score += 0.4;
        }

        // Visual-related error patterns
        const visualErrors = metrics.errorPatterns.filter(p =>
            p.includes('visual') || p.includes('image') || p.includes('diagram')
        );
        if (visualErrors.length > 2) {
            score += 0.6;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Analyze trend over multiple sessions
     */
    private analyzeTrend(userId: string): DisabilityIndicators {
        const sessions = this.sessionHistory.get(userId) || [];

        if (sessions.length < this.MIN_SESSIONS_FOR_DETECTION) {
            return {
                dyslexia: 0,
                adhd: 0,
                speechDelay: 0,
                hearingIssues: 0,
                visualProcessing: 0,
                overall: 0
            };
        }

        // Calculate average indicators across sessions
        const avgIndicators = sessions.reduce((acc, session) => {
            const indicators = this.calculateIndicators(session.metrics);
            return {
                dyslexia: acc.dyslexia + indicators.dyslexia,
                adhd: acc.adhd + indicators.adhd,
                speechDelay: acc.speechDelay + indicators.speechDelay,
                hearingIssues: acc.hearingIssues + indicators.hearingIssues,
                visualProcessing: acc.visualProcessing + indicators.visualProcessing,
                overall: acc.overall + indicators.overall
            };
        }, {
            dyslexia: 0,
            adhd: 0,
            speechDelay: 0,
            hearingIssues: 0,
            visualProcessing: 0,
            overall: 0
        });

        const count = sessions.length;
        return {
            dyslexia: avgIndicators.dyslexia / count,
            adhd: avgIndicators.adhd / count,
            speechDelay: avgIndicators.speechDelay / count,
            hearingIssues: avgIndicators.hearingIssues / count,
            visualProcessing: avgIndicators.visualProcessing / count,
            overall: avgIndicators.overall / count
        };
    }

    /**
     * Combine current and historical indicators
     */
    private combineIndicators(
        current: DisabilityIndicators,
        trend: DisabilityIndicators
    ): DisabilityIndicators {
        // Weight: 60% current, 40% historical
        return {
            dyslexia: current.dyslexia * 0.6 + trend.dyslexia * 0.4,
            adhd: current.adhd * 0.6 + trend.adhd * 0.4,
            speechDelay: current.speechDelay * 0.6 + trend.speechDelay * 0.4,
            hearingIssues: current.hearingIssues * 0.6 + trend.hearingIssues * 0.4,
            visualProcessing: current.visualProcessing * 0.6 + trend.visualProcessing * 0.4,
            overall: current.overall * 0.6 + trend.overall * 0.4
        };
    }

    /**
     * Generate personalized recommendations
     */
    private generateRecommendations(indicators: DisabilityIndicators): string[] {
        const recommendations: string[] = [];

        if (indicators.dyslexia > 0.5) {
            recommendations.push('Use larger fonts and high-contrast text');
            recommendations.push('Enable text-to-speech for reading materials');
            recommendations.push('Provide extra time for reading tasks');
            recommendations.push('Use multi-sensory learning approaches');
        }

        if (indicators.adhd > 0.5) {
            recommendations.push('Break lessons into shorter segments');
            recommendations.push('Use interactive and engaging content');
            recommendations.push('Provide frequent breaks');
            recommendations.push('Minimize distractions in learning environment');
        }

        if (indicators.speechDelay > 0.5) {
            recommendations.push('Enable speech therapy exercises');
            recommendations.push('Use visual cues alongside verbal instructions');
            recommendations.push('Allow extra time for verbal responses');
            recommendations.push('Practice pronunciation with AI feedback');
        }

        if (indicators.hearingIssues > 0.5) {
            recommendations.push('Enable visual captions for all audio');
            recommendations.push('Use sign language support');
            recommendations.push('Provide written transcripts');
            recommendations.push('Consider professional hearing assessment');
        }

        if (indicators.visualProcessing > 0.5) {
            recommendations.push('Simplify visual presentations');
            recommendations.push('Use audio descriptions for images');
            recommendations.push('Reduce visual clutter');
            recommendations.push('Provide tactile learning materials');
        }

        if (recommendations.length === 0) {
            recommendations.push('Continue current learning approach');
            recommendations.push('Monitor progress regularly');
        }

        return recommendations;
    }

    /**
     * Suggest optimal adaptive learning mode
     */
    private suggestAdaptiveMode(
        indicators: DisabilityIndicators
    ): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
        const scores = {
            visual: 1.0 - indicators.visualProcessing,
            auditory: 1.0 - indicators.hearingIssues,
            kinesthetic: 1.0 - (indicators.adhd * 0.5 + indicators.dyslexia * 0.5)
        };

        const maxScore = Math.max(scores.visual, scores.auditory, scores.kinesthetic);

        // If scores are close, use mixed mode
        const variance = Math.max(...Object.values(scores)) - Math.min(...Object.values(scores));
        if (variance < 0.2) {
            return 'mixed';
        }

        if (scores.visual === maxScore) return 'visual';
        if (scores.auditory === maxScore) return 'auditory';
        return 'kinesthetic';
    }

    /**
     * Add session to history
     */
    private addSession(userId: string, metrics: BehavioralMetrics): void {
        const sessions = this.sessionHistory.get(userId) || [];
        sessions.push({
            userId,
            sessionId: this.generateSessionId(),
            duration: 0,
            metrics,
            timestamp: new Date()
        });

        // Keep only last 20 sessions
        if (sessions.length > 20) {
            sessions.shift();
        }

        this.sessionHistory.set(userId, sessions);
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get user's detection history
     */
    getDetectionHistory(userId: string): LearningSession[] {
        return this.sessionHistory.get(userId) || [];
    }

    /**
     * Clear user's detection history
     */
    clearHistory(userId: string): void {
        this.sessionHistory.delete(userId);
    }
}

export const disabilityDetectionService = new DisabilityDetectionService();
