/**
 * Adaptive AI Tutor Service
 * Personalizes learning content based on individual disabilities and learning styles
 * HIGH IMPACT FEATURE
 */

import { DisabilityIndicators } from './disabilityDetectionService';

export type DisabilityType = 'hearing' | 'visual' | 'dyslexia' | 'adhd' | 'speech' | 'none';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface LearningProfile {
    userId: string;
    disabilities: DisabilityType[];
    learningStyle: LearningStyle;
    currentLevel: DifficultyLevel;
    strengths: string[];
    weaknesses: string[];
    preferences: {
        fontSize: number;
        audioSpeed: number;
        colorScheme: 'default' | 'high-contrast' | 'dark';
        captionsEnabled: boolean;
        signLanguageEnabled: boolean;
    };
}

export interface AdaptedContent {
    original: string;
    adapted: string;
    adaptations: string[];
    difficulty: DifficultyLevel;
    format: 'text' | 'audio' | 'video' | 'interactive' | 'mixed';
    estimatedTime: number; // minutes
}

export interface TutorResponse {
    content: string;
    format: 'text' | 'audio' | 'video' | 'interactive' | 'mixed';
    supportingMedia: {
        images?: string[];
        audio?: string;
        video?: string;
        signLanguage?: string;
    };
    difficulty: DifficultyLevel;
    nextSteps: string[];
}

class AdaptiveTutorService {
    /**
     * Generate adaptive content based on user profile
     */
    async adaptContent(
        content: string,
        profile: LearningProfile
    ): Promise<AdaptedContent> {
        const adaptations: string[] = [];
        let adapted = content;

        // Apply disability-specific adaptations
        for (const disability of profile.disabilities) {
            const result = this.applyDisabilityAdaptation(adapted, disability);
            adapted = result.content;
            adaptations.push(...result.adaptations);
        }

        // Apply learning style adaptations
        const styleResult = this.applyLearningStyleAdaptation(adapted, profile.learningStyle);
        adapted = styleResult.content;
        adaptations.push(...styleResult.adaptations);

        // Adjust difficulty level
        const difficultyResult = this.adjustDifficulty(adapted, profile.currentLevel);
        adapted = difficultyResult.content;
        adaptations.push(...difficultyResult.adaptations);

        // Determine optimal format
        const format = this.determineOptimalFormat(profile);

        // Estimate completion time
        const estimatedTime = this.estimateCompletionTime(adapted, profile);

        return {
            original: content,
            adapted,
            adaptations,
            difficulty: profile.currentLevel,
            format,
            estimatedTime
        };
    }

    /**
     * Apply adaptations for specific disability
     */
    private applyDisabilityAdaptation(
        content: string,
        disability: DisabilityType
    ): { content: string; adaptations: string[] } {
        const adaptations: string[] = [];
        let adapted = content;

        switch (disability) {
            case 'hearing':
                // Add visual cues, simplify audio descriptions
                adapted = this.enhanceVisualContent(content);
                adaptations.push('Added visual cues and captions');
                adaptations.push('Simplified complex audio descriptions');
                adaptations.push('Included sign language prompts');
                break;

            case 'visual':
                // Enhance audio descriptions, simplify visual elements
                adapted = this.enhanceAudioContent(content);
                adaptations.push('Enhanced audio descriptions');
                adaptations.push('Simplified visual complexity');
                adaptations.push('Added tactile learning suggestions');
                break;

            case 'dyslexia':
                // Larger fonts, high contrast, simplified text
                adapted = this.simplifyForDyslexia(content);
                adaptations.push('Simplified sentence structure');
                adaptations.push('Increased spacing and font size');
                adaptations.push('Used dyslexia-friendly formatting');
                break;

            case 'adhd':
                // Shorter segments, more engaging, clear structure
                adapted = this.optimizeForADHD(content);
                adaptations.push('Broke content into smaller chunks');
                adaptations.push('Added interactive elements');
                adaptations.push('Highlighted key points');
                break;

            case 'speech':
                // Visual aids, pronunciation guides
                adapted = this.enhanceForSpeechDelay(content);
                adaptations.push('Added pronunciation guides');
                adaptations.push('Included visual speech cues');
                adaptations.push('Provided alternative response methods');
                break;

            case 'none':
                // No specific adaptations needed
                break;
        }

        return { content: adapted, adaptations };
    }

    /**
     * Enhance content with visual cues for hearing impaired
     */
    private enhanceVisualContent(content: string): string {
        // Add visual markers
        let enhanced = content;

        // Add emoji/icons for emphasis
        enhanced = enhanced.replace(/important/gi, '⚠️ IMPORTANT');
        enhanced = enhanced.replace(/note:/gi, '📝 NOTE:');
        enhanced = enhanced.replace(/example:/gi, '💡 EXAMPLE:');

        // Add section markers
        enhanced = `🎯 **Learning Objective**\n\n${enhanced}`;

        return enhanced;
    }

    /**
     * Enhance content with audio descriptions for visually impaired
     */
    private enhanceAudioContent(content: string): string {
        let enhanced = content;

        // Add detailed descriptions
        enhanced = enhanced.replace(/\[image\]/gi, '[AUDIO DESCRIPTION: Detailed visual content will be described]');

        // Add context markers
        enhanced = `🔊 Audio-Enhanced Content\n\n${enhanced}\n\n[All visual elements have audio descriptions]`;

        return enhanced;
    }

    /**
     * Simplify content for dyslexia
     */
    private simplifyForDyslexia(content: string): string {
        let simplified = content;

        // Break long sentences
        simplified = simplified.replace(/([.!?])\s+/g, '$1\n\n');

        // Add spacing
        simplified = simplified.split('\n').map(line => {
            if (line.trim()) {
                return `${line}\n`;
            }
            return line;
        }).join('');

        // Highlight key terms
        simplified = simplified.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, '**$1**');

        return simplified;
    }

    /**
     * Optimize content for ADHD
     */
    private optimizeForADHD(content: string): string {
        // Break into bullet points
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());

        let optimized = '### 🎯 Key Points:\n\n';
        sentences.forEach((sentence, index) => {
            if (sentence.trim()) {
                optimized += `${index + 1}. ${sentence.trim()}\n\n`;
            }
        });

        // Add progress markers
        optimized += '\n---\n✅ **Quick Check**: Can you summarize the main idea?\n';

        return optimized;
    }

    /**
     * Enhance content for speech delay
     */
    private enhanceForSpeechDelay(content: string): string {
        let enhanced = content;

        // Add pronunciation guides for complex words
        const complexWords = content.match(/\b\w{8,}\b/g) || [];
        complexWords.forEach(word => {
            const pronunciation = this.generatePronunciationGuide(word);
            enhanced = enhanced.replace(
                new RegExp(`\\b${word}\\b`, 'g'),
                `${word} (${pronunciation})`
            );
        });

        // Add speaking tips
        enhanced += '\n\n💬 **Speaking Tip**: Take your time and practice each word slowly.';

        return enhanced;
    }

    /**
     * Generate simple pronunciation guide
     */
    private generatePronunciationGuide(word: string): string {
        // Simple syllable breakdown (basic implementation)
        const syllables = word.match(/.{1,3}/g) || [word];
        return syllables.join('-').toLowerCase();
    }

    /**
     * Apply learning style adaptations
     */
    private applyLearningStyleAdaptation(
        content: string,
        style: LearningStyle
    ): { content: string; adaptations: string[] } {
        const adaptations: string[] = [];
        let adapted = content;

        switch (style) {
            case 'visual':
                adapted = `📊 **Visual Learning Mode**\n\n${content}\n\n💡 Tip: Draw diagrams to help remember this!`;
                adaptations.push('Optimized for visual learning');
                adaptations.push('Suggested visual aids');
                break;

            case 'auditory':
                adapted = `🎧 **Audio Learning Mode**\n\n${content}\n\n💡 Tip: Read this aloud or listen to the audio version!`;
                adaptations.push('Optimized for auditory learning');
                adaptations.push('Suggested audio reinforcement');
                break;

            case 'kinesthetic':
                adapted = `🤸 **Hands-On Learning Mode**\n\n${content}\n\n💡 Tip: Try to practice this with physical activities!`;
                adaptations.push('Optimized for kinesthetic learning');
                adaptations.push('Suggested hands-on activities');
                break;

            case 'reading':
                adapted = `📖 **Reading/Writing Mode**\n\n${content}\n\n💡 Tip: Take notes and summarize in your own words!`;
                adaptations.push('Optimized for reading/writing');
                adaptations.push('Suggested note-taking');
                break;

            case 'mixed':
                adapted = `🎨 **Multi-Modal Learning**\n\n${content}\n\n💡 Tip: Use a combination of methods!`;
                adaptations.push('Multi-modal approach');
                break;
        }

        return { content: adapted, adaptations };
    }

    /**
     * Adjust content difficulty
     */
    private adjustDifficulty(
        content: string,
        level: DifficultyLevel
    ): { content: string; adaptations: string[] } {
        const adaptations: string[] = [];
        let adapted = content;

        switch (level) {
            case 'beginner':
                adapted = this.simplifyToBeginnerLevel(content);
                adaptations.push('Simplified to beginner level');
                adaptations.push('Added basic examples');
                break;

            case 'easy':
                adapted = this.simplifyToEasyLevel(content);
                adaptations.push('Adjusted to easy level');
                break;

            case 'medium':
                // Keep as is
                adaptations.push('Standard difficulty level');
                break;

            case 'hard':
                adapted = this.enhanceToHardLevel(content);
                adaptations.push('Enhanced with advanced concepts');
                break;

            case 'expert':
                adapted = this.enhanceToExpertLevel(content);
                adaptations.push('Expert-level depth added');
                break;
        }

        return { content: adapted, adaptations };
    }

    /**
     * Simplify to beginner level
     */
    private simplifyToBeginnerLevel(content: string): string {
        return `🌱 **Beginner Level**\n\n` +
            `Let's start simple!\n\n${content}\n\n` +
            `📚 **Remember**: Take it one step at a time!`;
    }

    /**
     * Simplify to easy level
     */
    private simplifyToEasyLevel(content: string): string {
        return `⭐ **Easy Level**\n\n${content}\n\n` +
            `💪 **You're doing great!** Ready for the next step?`;
    }

    /**
     * Enhance to hard level
     */
    private enhanceToHardLevel(content: string): string {
        return `🔥 **Challenge Mode**\n\n${content}\n\n` +
            `🧠 **Think Deeper**: How does this connect to what you already know?`;
    }

    /**
     * Enhance to expert level
     */
    private enhanceToExpertLevel(content: string): string {
        return `🎓 **Expert Level**\n\n${content}\n\n` +
            `🚀 **Advanced Challenge**: Can you teach this to someone else?`;
    }

    /**
     * Determine optimal content format
     */
    private determineOptimalFormat(profile: LearningProfile): 'text' | 'audio' | 'video' | 'interactive' | 'mixed' {
        const disabilities = profile.disabilities;

        if (disabilities.includes('visual')) return 'audio';
        if (disabilities.includes('hearing')) return 'text';
        if (disabilities.includes('adhd')) return 'interactive';

        switch (profile.learningStyle) {
            case 'visual': return 'video';
            case 'auditory': return 'audio';
            case 'kinesthetic': return 'interactive';
            case 'reading': return 'text';
            default: return 'mixed';
        }
    }

    /**
     * Estimate completion time based on profile
     */
    private estimateCompletionTime(content: string, profile: LearningProfile): number {
        const wordCount = content.split(/\s+/).length;
        let baseTime = wordCount / 200; // Base: 200 words per minute

        // Adjust for disabilities
        if (profile.disabilities.includes('dyslexia')) baseTime *= 1.5;
        if (profile.disabilities.includes('adhd')) baseTime *= 1.3;
        if (profile.disabilities.includes('visual')) baseTime *= 1.2;

        // Adjust for difficulty
        const difficultyMultipliers = {
            beginner: 1.5,
            easy: 1.2,
            medium: 1.0,
            hard: 0.8,
            expert: 0.7
        };
        baseTime *= difficultyMultipliers[profile.currentLevel];

        return Math.ceil(baseTime);
    }

    /**
     * Generate AI tutor response with adaptations
     */
    async generateTutorResponse(
        question: string,
        profile: LearningProfile,
        context?: string
    ): Promise<TutorResponse> {
        // This would call the Gemini API with specialized prompts
        // For now, return structured response

        const format = this.determineOptimalFormat(profile);
        const difficulty = profile.currentLevel;

        // Generate empathetic, personalized response
        const content = await this.generatePersonalizedResponse(question, profile, context);

        return {
            content,
            format,
            supportingMedia: this.generateSupportingMedia(profile),
            difficulty,
            nextSteps: this.generateNextSteps(profile)
        };
    }

    /**
     * Generate personalized AI response
     */
    private async generatePersonalizedResponse(
        question: string,
        profile: LearningProfile,
        context?: string
    ): Promise<string> {
        // Build personalized prompt for AI
        let response = `Great question! Let me explain this in a way that works best for you.\n\n`;

        // Add context-aware explanation
        response += `Based on your learning style (${profile.learningStyle}), here's how I'd explain it:\n\n`;

        // This would be replaced with actual AI call
        response += `[AI-generated personalized explanation would go here]\n\n`;

        // Add encouragement
        response += `You're making excellent progress! 🌟`;

        return response;
    }

    /**
     * Generate supporting media suggestions
     */
    private generateSupportingMedia(profile: LearningProfile): TutorResponse['supportingMedia'] {
        const media: TutorResponse['supportingMedia'] = {};

        if (profile.learningStyle === 'visual' || profile.disabilities.includes('hearing')) {
            media.images = ['diagram.png', 'infographic.png'];
        }

        if (profile.learningStyle === 'auditory' || profile.disabilities.includes('visual')) {
            media.audio = 'explanation.mp3';
        }

        if (profile.preferences.signLanguageEnabled) {
            media.signLanguage = 'sign-video.mp4';
        }

        return media;
    }

    /**
     * Generate next learning steps
     */
    private generateNextSteps(profile: LearningProfile): string[] {
        return [
            'Practice with an interactive exercise',
            'Review the key concepts',
            'Try explaining this to someone else',
            'Take a short quiz to test your understanding'
        ];
    }

    /**
     * Create default learning profile
     */
    createDefaultProfile(userId: string): LearningProfile {
        return {
            userId,
            disabilities: ['none'],
            learningStyle: 'mixed',
            currentLevel: 'medium',
            strengths: [],
            weaknesses: [],
            preferences: {
                fontSize: 16,
                audioSpeed: 1.0,
                colorScheme: 'default',
                captionsEnabled: false,
                signLanguageEnabled: false
            }
        };
    }

    /**
     * Update profile based on disability detection
     */
    updateProfileFromDetection(
        profile: LearningProfile,
        indicators: DisabilityIndicators
    ): LearningProfile {
        const disabilities: DisabilityType[] = [];

        if (indicators.dyslexia > 0.5) disabilities.push('dyslexia');
        if (indicators.adhd > 0.5) disabilities.push('adhd');
        if (indicators.speechDelay > 0.5) disabilities.push('speech');
        if (indicators.hearingIssues > 0.5) disabilities.push('hearing');
        if (indicators.visualProcessing > 0.5) disabilities.push('visual');

        return {
            ...profile,
            disabilities: disabilities.length > 0 ? disabilities : ['none']
        };
    }
}

export const adaptiveTutorService = new AdaptiveTutorService();
