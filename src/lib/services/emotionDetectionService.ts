/**
 * Emotion-Aware Learning Service
 * Detects student emotions and adapts learning experience
 * Human-centered AI feature
 */

export type EmotionType = 'happy' | 'sad' | 'frustrated' | 'confused' | 'excited' | 'bored' | 'neutral' | 'anxious';

export interface EmotionData {
    primary: EmotionType;
    confidence: number; // 0-1
    secondary?: EmotionType;
    intensity: number; // 0-1
    timestamp: number;
}

export interface VoiceEmotionData {
    tone: 'positive' | 'negative' | 'neutral';
    energy: number; // 0-1
    pace: 'fast' | 'normal' | 'slow';
    clarity: number; // 0-1
}

export interface FacialEmotionData {
    expression: EmotionType;
    confidence: number;
    facialFeatures: {
        eyebrows: 'raised' | 'furrowed' | 'neutral';
        mouth: 'smile' | 'frown' | 'neutral';
        eyes: 'wide' | 'squinted' | 'normal';
    };
}

export interface EmotionalState {
    current: EmotionData;
    trend: 'improving' | 'declining' | 'stable';
    history: EmotionData[];
    needsSupport: boolean;
    supportType?: 'encouragement' | 'simplification' | 'break' | 'help';
}

export interface EmpatheticResponse {
    message: string;
    tone: 'encouraging' | 'supportive' | 'celebratory' | 'gentle';
    action?: 'pause' | 'simplify' | 'provide-example' | 'offer-break' | 'continue';
    emoji: string;
}

class EmotionDetectionService {
    private emotionHistory: Map<string, EmotionData[]> = new Map();
    private readonly HISTORY_SIZE = 50;
    private readonly FRUSTRATION_THRESHOLD = 0.6;
    private readonly CONFUSION_THRESHOLD = 0.5;

    /**
     * Analyze emotion from facial expression
     */
    async analyzeFacialEmotion(imageData: ImageData | HTMLVideoElement): Promise<FacialEmotionData | null> {
        try {
            // This would use a facial emotion recognition model
            // For now, simulated implementation
            const emotion = this.detectFacialEmotion(imageData);
            return emotion;
        } catch (error) {
            console.error('Error analyzing facial emotion:', error);
            return null;
        }
    }

    /**
     * Analyze emotion from voice
     */
    async analyzeVoiceEmotion(audioData: AudioBuffer | Blob): Promise<VoiceEmotionData | null> {
        try {
            // This would use speech sentiment analysis
            // For now, simulated implementation
            const emotion = this.detectVoiceEmotion(audioData);
            return emotion;
        } catch (error) {
            console.error('Error analyzing voice emotion:', error);
            return null;
        }
    }

    /**
     * Combine facial and voice emotion data
     */
    combineEmotionData(
        facial: FacialEmotionData | null,
        voice: VoiceEmotionData | null
    ): EmotionData {
        if (!facial && !voice) {
            return {
                primary: 'neutral',
                confidence: 0.5,
                intensity: 0.5,
                timestamp: Date.now()
            };
        }

        if (facial && !voice) {
            return {
                primary: facial.expression,
                confidence: facial.confidence,
                intensity: this.calculateIntensity(facial),
                timestamp: Date.now()
            };
        }

        if (!facial && voice) {
            return {
                primary: this.voiceToneToEmotion(voice.tone),
                confidence: voice.energy,
                intensity: voice.energy,
                timestamp: Date.now()
            };
        }

        // Combine both
        const combinedEmotion = this.mergeFacialAndVoice(facial!, voice!);
        return combinedEmotion;
    }

    /**
     * Get current emotional state for user
     */
    getEmotionalState(userId: string): EmotionalState {
        const history = this.emotionHistory.get(userId) || [];

        if (history.length === 0) {
            return {
                current: {
                    primary: 'neutral',
                    confidence: 0.5,
                    intensity: 0.5,
                    timestamp: Date.now()
                },
                trend: 'stable',
                history: [],
                needsSupport: false
            };
        }

        const current = history[history.length - 1];
        const trend = this.analyzeTrend(history);
        const needsSupport = this.checkNeedsSupport(current, history);
        const supportType = needsSupport ? this.determineSupportType(current, history) : undefined;

        return {
            current,
            trend,
            history: history.slice(-10), // Last 10 emotions
            needsSupport,
            supportType
        };
    }

    /**
     * Generate empathetic response based on emotion
     */
    generateEmpatheticResponse(emotion: EmotionData, context?: string): EmpatheticResponse {
        switch (emotion.primary) {
            case 'frustrated':
                return {
                    message: "I can see this is challenging. It's okay to find things difficult - that means you're learning! Let's try a different approach. 😊",
                    tone: 'supportive',
                    action: 'simplify',
                    emoji: '💪'
                };

            case 'confused':
                return {
                    message: "No worries if this seems unclear! Let me explain it in a simpler way with an example. 🤔",
                    tone: 'gentle',
                    action: 'provide-example',
                    emoji: '💡'
                };

            case 'bored':
                return {
                    message: "Let's make this more interesting! How about we try an interactive challenge? 🎮",
                    tone: 'encouraging',
                    action: 'continue',
                    emoji: '🚀'
                };

            case 'anxious':
                return {
                    message: "Take a deep breath! There's no rush. We'll go at your pace, and you're doing great! 🌟",
                    tone: 'gentle',
                    action: 'pause',
                    emoji: '🌈'
                };

            case 'sad':
                return {
                    message: "I'm here to help! Remember, every expert was once a beginner. You've got this! ❤️",
                    tone: 'supportive',
                    action: 'offer-break',
                    emoji: '🤗'
                };

            case 'happy':
                return {
                    message: "Wonderful! I love seeing you enjoy learning! Keep up the great work! 🎉",
                    tone: 'celebratory',
                    action: 'continue',
                    emoji: '⭐'
                };

            case 'excited':
                return {
                    message: "Your enthusiasm is amazing! Let's channel that energy into learning something new! 🔥",
                    tone: 'celebratory',
                    action: 'continue',
                    emoji: '🚀'
                };

            default:
                return {
                    message: "You're doing well! Let me know if you need any help. 😊",
                    tone: 'encouraging',
                    action: 'continue',
                    emoji: '👍'
                };
        }
    }

    /**
     * Add emotion to user history
     */
    addEmotionData(userId: string, emotion: EmotionData): void {
        const history = this.emotionHistory.get(userId) || [];
        history.push(emotion);

        // Keep only recent history
        if (history.length > this.HISTORY_SIZE) {
            history.shift();
        }

        this.emotionHistory.set(userId, history);
    }

    /**
     * Detect facial emotion (simulated)
     */
    private detectFacialEmotion(imageData: any): FacialEmotionData {
        // This would use TensorFlow.js emotion detection model
        // Simulated for now
        const emotions: EmotionType[] = ['happy', 'neutral', 'confused', 'frustrated'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

        return {
            expression: randomEmotion,
            confidence: 0.7 + Math.random() * 0.3,
            facialFeatures: {
                eyebrows: 'neutral',
                mouth: randomEmotion === 'happy' ? 'smile' : 'neutral',
                eyes: 'normal'
            }
        };
    }

    /**
     * Detect voice emotion (simulated)
     */
    private detectVoiceEmotion(audioData: any): VoiceEmotionData {
        // This would use speech sentiment analysis
        // Simulated for now
        const tones: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'neutral', 'negative'];
        const randomTone = tones[Math.floor(Math.random() * tones.length)];

        return {
            tone: randomTone,
            energy: 0.5 + Math.random() * 0.5,
            pace: 'normal',
            clarity: 0.7 + Math.random() * 0.3
        };
    }

    /**
     * Calculate emotion intensity from facial features
     */
    private calculateIntensity(facial: FacialEmotionData): number {
        let intensity = 0.5;

        if (facial.facialFeatures.eyebrows === 'raised') intensity += 0.2;
        if (facial.facialFeatures.eyebrows === 'furrowed') intensity += 0.3;
        if (facial.facialFeatures.mouth === 'smile') intensity += 0.2;
        if (facial.facialFeatures.mouth === 'frown') intensity += 0.3;

        return Math.min(intensity, 1.0);
    }

    /**
     * Convert voice tone to emotion
     */
    private voiceToneToEmotion(tone: 'positive' | 'negative' | 'neutral'): EmotionType {
        switch (tone) {
            case 'positive': return 'happy';
            case 'negative': return 'frustrated';
            default: return 'neutral';
        }
    }

    /**
     * Merge facial and voice emotion data
     */
    private mergeFacialAndVoice(facial: FacialEmotionData, voice: VoiceEmotionData): EmotionData {
        // Weight: 60% facial, 40% voice
        const facialWeight = 0.6;
        const voiceWeight = 0.4;

        const confidence = facial.confidence * facialWeight + voice.energy * voiceWeight;

        // Determine primary emotion
        let primary: EmotionType = facial.expression;

        // If voice strongly disagrees, adjust
        if (voice.tone === 'negative' && (facial.expression === 'happy' || facial.expression === 'excited')) {
            primary = 'confused'; // Mixed signals
        }

        return {
            primary,
            confidence,
            secondary: this.voiceToneToEmotion(voice.tone),
            intensity: this.calculateIntensity(facial),
            timestamp: Date.now()
        };
    }

    /**
     * Analyze emotional trend
     */
    private analyzeTrend(history: EmotionData[]): 'improving' | 'declining' | 'stable' {
        if (history.length < 3) return 'stable';

        const recent = history.slice(-5);
        const positiveEmotions: EmotionType[] = ['happy', 'excited'];
        const negativeEmotions: EmotionType[] = ['frustrated', 'sad', 'anxious', 'confused'];

        let positiveCount = 0;
        let negativeCount = 0;

        recent.forEach(emotion => {
            if (positiveEmotions.includes(emotion.primary)) positiveCount++;
            if (negativeEmotions.includes(emotion.primary)) negativeCount++;
        });

        if (positiveCount > negativeCount * 1.5) return 'improving';
        if (negativeCount > positiveCount * 1.5) return 'declining';
        return 'stable';
    }

    /**
     * Check if user needs emotional support
     */
    private checkNeedsSupport(current: EmotionData, history: EmotionData[]): boolean {
        // High intensity negative emotion
        if (current.intensity > 0.7 && ['frustrated', 'sad', 'anxious'].includes(current.primary)) {
            return true;
        }

        // Persistent confusion
        const recentConfusion = history.slice(-3).filter(e => e.primary === 'confused').length;
        if (recentConfusion >= 2) return true;

        // Declining trend with negative emotion
        const trend = this.analyzeTrend(history);
        if (trend === 'declining' && ['frustrated', 'bored', 'sad'].includes(current.primary)) {
            return true;
        }

        return false;
    }

    /**
     * Determine type of support needed
     */
    private determineSupportType(
        current: EmotionData,
        history: EmotionData[]
    ): 'encouragement' | 'simplification' | 'break' | 'help' {
        if (current.primary === 'frustrated' && current.intensity > 0.7) {
            return 'break';
        }

        if (current.primary === 'confused') {
            return 'simplification';
        }

        if (current.primary === 'bored') {
            return 'help'; // Offer different activity
        }

        if (['sad', 'anxious'].includes(current.primary)) {
            return 'encouragement';
        }

        return 'encouragement';
    }

    /**
     * Get emotion statistics for a session
     */
    getEmotionStatistics(userId: string): {
        dominant: EmotionType;
        distribution: Record<EmotionType, number>;
        averageIntensity: number;
        supportNeeded: number;
    } {
        const history = this.emotionHistory.get(userId) || [];

        if (history.length === 0) {
            return {
                dominant: 'neutral',
                distribution: {} as Record<EmotionType, number>,
                averageIntensity: 0.5,
                supportNeeded: 0
            };
        }

        // Calculate distribution
        const distribution: Partial<Record<EmotionType, number>> = {};
        history.forEach(emotion => {
            distribution[emotion.primary] = (distribution[emotion.primary] || 0) + 1;
        });

        // Find dominant emotion
        const dominant = Object.entries(distribution).reduce((a, b) =>
            b[1] > a[1] ? b : a
        )[0] as EmotionType;

        // Calculate average intensity
        const averageIntensity = history.reduce((sum, e) => sum + e.intensity, 0) / history.length;

        // Count support instances
        const supportNeeded = history.filter(e =>
            this.checkNeedsSupport(e, history)
        ).length;

        return {
            dominant,
            distribution: distribution as Record<EmotionType, number>,
            averageIntensity,
            supportNeeded
        };
    }

    /**
     * Clear emotion history for user
     */
    clearHistory(userId: string): void {
        this.emotionHistory.delete(userId);
    }
}

export const emotionDetectionService = new EmotionDetectionService();
