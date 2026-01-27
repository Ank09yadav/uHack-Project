export interface UserProgress {
    userId: string;
    moduleId: string;
    completed: boolean;
    score: number;
    timeSpent: number; // in minutes
    lastAccessed: Date;
    quizScores: number[];
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    unlockedAt?: Date;
}

export interface UserStats {
    totalPoints: number;
    level: number;
    streak: number; // consecutive days
    achievements: Achievement[];
    modulesCompleted: number;
    totalTimeSpent: number;
}

class GamificationService {
    private readonly POINTS_PER_MODULE = 100;
    private readonly POINTS_PER_QUIZ = 50;
    private readonly STREAK_BONUS = 10;
    private readonly LEVEL_THRESHOLD = 500; // points per level

    /**
     * Calculate points earned for completing a module
     */
    calculateModulePoints(score: number, timeSpent: number): number {
        const basePoints = this.POINTS_PER_MODULE;
        const scoreBonus = Math.floor(score * 50); // 0-50 bonus points
        const speedBonus = timeSpent < 30 ? 25 : timeSpent < 60 ? 10 : 0;

        return basePoints + scoreBonus + speedBonus;
    }

    /**
     * Calculate points for quiz completion
     */
    calculateQuizPoints(correctAnswers: number, totalQuestions: number): number {
        const percentage = correctAnswers / totalQuestions;
        return Math.floor(this.POINTS_PER_QUIZ * percentage);
    }

    /**
     * Calculate user level based on total points
     */
    calculateLevel(totalPoints: number): number {
        return Math.floor(totalPoints / this.LEVEL_THRESHOLD) + 1;
    }

    /**
     * Calculate points needed for next level
     */
    pointsToNextLevel(totalPoints: number): number {
        const currentLevel = this.calculateLevel(totalPoints);
        const nextLevelPoints = currentLevel * this.LEVEL_THRESHOLD;
        return nextLevelPoints - totalPoints;
    }

    /**
     * Check if user earned any achievements
     */
    checkAchievements(stats: UserStats): Achievement[] {
        const newAchievements: Achievement[] = [];
        const allAchievements = this.getAllAchievements();

        for (const achievement of allAchievements) {
            const alreadyUnlocked = stats.achievements.some(a => a.id === achievement.id);
            if (!alreadyUnlocked && this.meetsRequirement(achievement.id, stats)) {
                newAchievements.push({
                    ...achievement,
                    unlockedAt: new Date()
                });
            }
        }

        return newAchievements;
    }

    /**
     * Get all available achievements
     */
    getAllAchievements(): Achievement[] {
        return [
            {
                id: 'first_module',
                name: 'First Steps',
                description: 'Complete your first learning module',
                icon: '🎯',
                points: 50
            },
            {
                id: 'five_modules',
                name: 'Learning Enthusiast',
                description: 'Complete 5 learning modules',
                icon: '📚',
                points: 100
            },
            {
                id: 'perfect_quiz',
                name: 'Perfect Score',
                description: 'Get 100% on a quiz',
                icon: '⭐',
                points: 75
            },
            {
                id: 'week_streak',
                name: 'Dedicated Learner',
                description: 'Maintain a 7-day learning streak',
                icon: '🔥',
                points: 150
            },
            {
                id: 'level_5',
                name: 'Rising Star',
                description: 'Reach level 5',
                icon: '🌟',
                points: 200
            },
            {
                id: 'ten_hours',
                name: 'Time Investment',
                description: 'Spend 10 hours learning',
                icon: '⏰',
                points: 100
            },
            {
                id: 'accessibility_explorer',
                name: 'Accessibility Explorer',
                description: 'Try all accessibility modes',
                icon: '♿',
                points: 50
            },
            {
                id: 'ai_helper',
                name: 'AI Assistant User',
                description: 'Ask the AI helper 10 questions',
                icon: '🤖',
                points: 75
            }
        ];
    }

    /**
     * Check if user meets achievement requirements
     */
    private meetsRequirement(achievementId: string, stats: UserStats): boolean {
        switch (achievementId) {
            case 'first_module':
                return stats.modulesCompleted >= 1;
            case 'five_modules':
                return stats.modulesCompleted >= 5;
            case 'perfect_quiz':
                // This would need to be checked separately with quiz data
                return false;
            case 'week_streak':
                return stats.streak >= 7;
            case 'level_5':
                return stats.level >= 5;
            case 'ten_hours':
                return stats.totalTimeSpent >= 600; // 10 hours in minutes
            default:
                return false;
        }
    }

    /**
     * Update streak based on last access date
     */
    updateStreak(lastAccessDate: Date, currentStreak: number): number {
        const now = new Date();
        const lastAccess = new Date(lastAccessDate);
        const daysDiff = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            // Consecutive day - increment streak
            return currentStreak + 1;
        } else if (daysDiff === 0) {
            // Same day - keep streak
            return currentStreak;
        } else {
            // Streak broken
            return 1;
        }
    }
}

export const gamificationService = new GamificationService();
