/**
 * AI-Generated IEP (Individualized Education Plan) Service
 * Creates government-compliant educational plans for students with disabilities
 * VERY STRONG FOR GOVERNMENT / NGO TRACKS
 */

import { DisabilityIndicators } from './disabilityDetectionService';
import { LearningProfile } from './adaptiveTutorService';

export interface StudentProfile {
    userId: string;
    name: string;
    age: number;
    grade: string;
    disabilities: string[];
    strengths: string[];
    weaknesses: string[];
    learningStyle: string;
    currentPerformance: PerformanceData;
}

export interface PerformanceData {
    academicScores: Record<string, number>; // subject -> score
    attendanceRate: number;
    assignmentCompletion: number;
    quizAverages: Record<string, number>;
    progressRate: number; // improvement over time
}

export interface IEPGoal {
    id: string;
    category: 'academic' | 'behavioral' | 'social' | 'functional';
    description: string;
    measurableObjective: string;
    targetDate: Date;
    progress: number; // 0-100
    strategies: string[];
    accommodations: string[];
    status: 'not-started' | 'in-progress' | 'achieved' | 'needs-revision';
}

export interface IEPDocument {
    studentId: string;
    studentName: string;
    createdDate: Date;
    reviewDate: Date;
    academicYear: string;

    // Student Information
    currentLevel: string;
    disabilityCategories: string[];

    // Present Levels of Performance
    strengths: string[];
    areasOfConcern: string[];
    currentPerformance: string;

    // Goals and Objectives
    goals: IEPGoal[];

    // Services and Accommodations
    specialEducationServices: string[];
    relatedServices: string[];
    accommodations: string[];
    modifications: string[];

    // Progress Monitoring
    assessmentMethods: string[];
    progressReportingSchedule: string;

    // AI Insights
    aiRecommendations: string[];
    predictedOutcomes: string[];

    // Metadata
    generatedBy: 'ai' | 'teacher' | 'collaborative';
    lastUpdated: Date;
}

export interface WeeklyPlan {
    week: number;
    focus: string;
    activities: string[];
    goals: string[];
    expectedOutcomes: string[];
}

class IEPGeneratorService {
    /**
     * Generate comprehensive IEP for a student
     */
    async generateIEP(
        student: StudentProfile,
        disabilityIndicators: DisabilityIndicators,
        learningProfile: LearningProfile
    ): Promise<IEPDocument> {
        const now = new Date();
        const reviewDate = new Date(now);
        reviewDate.setMonth(reviewDate.getMonth() + 3); // Review in 3 months

        // Analyze student data
        const analysis = this.analyzeStudentData(student, disabilityIndicators);

        // Generate goals
        const goals = this.generateGoals(student, analysis);

        // Determine services and accommodations
        const services = this.determineServices(disabilityIndicators, learningProfile);
        const accommodations = this.generateAccommodations(disabilityIndicators, learningProfile);

        // Generate AI recommendations
        const recommendations = this.generateRecommendations(student, analysis);

        // Predict outcomes
        const predictions = this.predictOutcomes(student, goals);

        const iep: IEPDocument = {
            studentId: student.userId,
            studentName: student.name,
            createdDate: now,
            reviewDate,
            academicYear: this.getCurrentAcademicYear(),

            currentLevel: `Grade ${student.grade}`,
            disabilityCategories: student.disabilities,

            strengths: student.strengths,
            areasOfConcern: student.weaknesses,
            currentPerformance: this.summarizePerformance(student.currentPerformance),

            goals,

            specialEducationServices: services.special,
            relatedServices: services.related,
            accommodations: accommodations.classroom,
            modifications: accommodations.curriculum,

            assessmentMethods: this.determineAssessmentMethods(disabilityIndicators),
            progressReportingSchedule: 'Weekly progress reports with monthly comprehensive reviews',

            aiRecommendations: recommendations,
            predictedOutcomes: predictions,

            generatedBy: 'ai',
            lastUpdated: now
        };

        return iep;
    }

    /**
     * Analyze student data to identify patterns
     */
    private analyzeStudentData(
        student: StudentProfile,
        indicators: DisabilityIndicators
    ): {
        primaryChallenges: string[];
        learningGaps: string[];
        supportNeeds: string[];
        priorityAreas: string[];
    } {
        const primaryChallenges: string[] = [];
        const learningGaps: string[] = [];
        const supportNeeds: string[] = [];

        // Analyze disability indicators
        if (indicators.dyslexia > 0.5) {
            primaryChallenges.push('Reading comprehension and fluency');
            learningGaps.push('Phonological awareness');
            supportNeeds.push('Reading intervention specialist');
        }

        if (indicators.adhd > 0.5) {
            primaryChallenges.push('Sustained attention and task completion');
            learningGaps.push('Executive functioning skills');
            supportNeeds.push('Behavioral support and structured routines');
        }

        if (indicators.speechDelay > 0.5) {
            primaryChallenges.push('Verbal expression and communication');
            learningGaps.push('Language development');
            supportNeeds.push('Speech-language therapy');
        }

        if (indicators.hearingIssues > 0.5) {
            primaryChallenges.push('Auditory processing and comprehension');
            learningGaps.push('Listening skills');
            supportNeeds.push('Audiological services and assistive technology');
        }

        if (indicators.visualProcessing > 0.5) {
            primaryChallenges.push('Visual information processing');
            learningGaps.push('Visual-spatial skills');
            supportNeeds.push('Occupational therapy');
        }

        // Analyze performance data
        const avgScore = Object.values(student.currentPerformance.academicScores).reduce((a, b) => a + b, 0) /
            Object.values(student.currentPerformance.academicScores).length;

        if (avgScore < 60) {
            learningGaps.push('Foundational academic skills');
            supportNeeds.push('Intensive academic intervention');
        }

        // Determine priority areas
        const priorityAreas = this.determinePriorityAreas(student, indicators);

        return {
            primaryChallenges,
            learningGaps,
            supportNeeds,
            priorityAreas
        };
    }

    /**
     * Generate SMART goals for the student
     */
    private generateGoals(
        student: StudentProfile,
        analysis: ReturnType<typeof this.analyzeStudentData>
    ): IEPGoal[] {
        const goals: IEPGoal[] = [];
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 3);

        // Academic goals
        analysis.priorityAreas.forEach((area, index) => {
            if (index < 3) { // Top 3 priorities
                goals.push({
                    id: `goal_academic_${index + 1}`,
                    category: 'academic',
                    description: `Improve ${area} skills`,
                    measurableObjective: `Increase ${area} performance by 20% within 3 months`,
                    targetDate,
                    progress: 0,
                    strategies: this.generateStrategies(area),
                    accommodations: this.generateGoalAccommodations(area),
                    status: 'not-started'
                });
            }
        });

        // Behavioral goals (if ADHD indicated)
        if (analysis.primaryChallenges.some(c => c.includes('attention'))) {
            goals.push({
                id: 'goal_behavioral_1',
                category: 'behavioral',
                description: 'Improve sustained attention and task completion',
                measurableObjective: 'Complete 80% of assigned tasks within allocated time',
                targetDate,
                progress: 0,
                strategies: [
                    'Use timer for task segments',
                    'Provide frequent breaks',
                    'Implement reward system for task completion'
                ],
                accommodations: [
                    'Extended time for assignments',
                    'Reduced distractions in learning environment',
                    'Visual schedules and checklists'
                ],
                status: 'not-started'
            });
        }

        // Social/Communication goals (if speech delay indicated)
        if (analysis.primaryChallenges.some(c => c.includes('communication'))) {
            goals.push({
                id: 'goal_social_1',
                category: 'social',
                description: 'Enhance verbal communication skills',
                measurableObjective: 'Participate in class discussions at least 3 times per session',
                targetDate,
                progress: 0,
                strategies: [
                    'Practice with speech therapy exercises',
                    'Use visual communication aids',
                    'Encourage peer interaction'
                ],
                accommodations: [
                    'Allow extra time for verbal responses',
                    'Provide alternative communication methods',
                    'Use supportive technology'
                ],
                status: 'not-started'
            });
        }

        // Functional goals
        goals.push({
            id: 'goal_functional_1',
            category: 'functional',
            description: 'Develop independent learning skills',
            measurableObjective: 'Independently complete 70% of learning activities with minimal prompting',
            targetDate,
            progress: 0,
            strategies: [
                'Teach self-monitoring techniques',
                'Provide organizational tools',
                'Build self-advocacy skills'
            ],
            accommodations: [
                'Visual aids and checklists',
                'Step-by-step instructions',
                'Assistive technology'
            ],
            status: 'not-started'
        });

        return goals;
    }

    /**
     * Determine required services
     */
    private determineServices(
        indicators: DisabilityIndicators,
        profile: LearningProfile
    ): {
        special: string[];
        related: string[];
    } {
        const special: string[] = [
            'Specialized instruction in areas of need',
            'Adaptive learning technology',
            'Progress monitoring and data collection'
        ];

        const related: string[] = [];

        if (indicators.speechDelay > 0.5) {
            related.push('Speech-Language Therapy (2x per week, 30 minutes)');
        }

        if (indicators.visualProcessing > 0.5 || indicators.adhd > 0.5) {
            related.push('Occupational Therapy (1x per week, 30 minutes)');
        }

        if (indicators.hearingIssues > 0.5) {
            related.push('Audiological Services (monthly consultation)');
        }

        if (indicators.overall > 0.6) {
            related.push('Counseling Services (1x per week, 30 minutes)');
            related.push('Parent training and support');
        }

        return { special, related };
    }

    /**
     * Generate accommodations
     */
    private generateAccommodations(
        indicators: DisabilityIndicators,
        profile: LearningProfile
    ): {
        classroom: string[];
        curriculum: string[];
    } {
        const classroom: string[] = [
            'Preferential seating',
            'Reduced distractions',
            'Access to assistive technology'
        ];

        const curriculum: string[] = [];

        if (indicators.dyslexia > 0.5) {
            classroom.push('Text-to-speech software', 'Audiobooks', 'Extended time for reading');
            curriculum.push('Modified reading materials', 'Simplified text', 'Visual aids');
        }

        if (indicators.adhd > 0.5) {
            classroom.push('Frequent breaks', 'Movement opportunities', 'Visual schedules');
            curriculum.push('Chunked assignments', 'Reduced homework load', 'Clear, concise instructions');
        }

        if (indicators.hearingIssues > 0.5) {
            classroom.push('Closed captioning', 'Sign language interpreter', 'FM system');
            curriculum.push('Visual learning materials', 'Written instructions', 'Transcripts');
        }

        if (indicators.visualProcessing > 0.5) {
            classroom.push('Audio descriptions', 'Tactile materials', 'Verbal instructions');
            curriculum.push('Reduced visual complexity', 'Audio-based content', 'Hands-on activities');
        }

        return { classroom, curriculum };
    }

    /**
     * Generate AI recommendations
     */
    private generateRecommendations(
        student: StudentProfile,
        analysis: ReturnType<typeof this.analyzeStudentData>
    ): string[] {
        const recommendations: string[] = [
            'Implement multi-sensory learning approaches to engage multiple learning pathways',
            'Use adaptive technology to personalize learning pace and content',
            'Provide frequent, positive reinforcement to build confidence',
            'Collaborate with parents for consistent support at home',
            'Monitor progress weekly and adjust strategies as needed'
        ];

        // Add specific recommendations based on analysis
        if (analysis.supportNeeds.includes('Reading intervention specialist')) {
            recommendations.push('Intensive phonics instruction using evidence-based programs');
            recommendations.push('Daily reading practice with decodable texts');
        }

        if (analysis.supportNeeds.includes('Behavioral support and structured routines')) {
            recommendations.push('Implement consistent daily routines and visual schedules');
            recommendations.push('Use positive behavior intervention strategies');
        }

        if (student.currentPerformance.assignmentCompletion < 0.7) {
            recommendations.push('Break assignments into smaller, manageable tasks');
            recommendations.push('Provide organizational tools and checklists');
        }

        return recommendations;
    }

    /**
     * Predict outcomes based on goals and current performance
     */
    private predictOutcomes(student: StudentProfile, goals: IEPGoal[]): string[] {
        const predictions: string[] = [];

        const avgScore = Object.values(student.currentPerformance.academicScores).reduce((a, b) => a + b, 0) /
            Object.values(student.currentPerformance.academicScores).length;

        if (avgScore < 60) {
            predictions.push('With consistent intervention, expect 15-25% improvement in academic performance within 3 months');
        } else {
            predictions.push('With targeted support, expect 10-20% improvement in areas of concern within 3 months');
        }

        predictions.push('Improved self-confidence and engagement in learning activities');
        predictions.push('Enhanced ability to self-advocate and communicate needs');
        predictions.push('Better attendance and assignment completion rates');

        if (goals.some(g => g.category === 'behavioral')) {
            predictions.push('Reduced behavioral incidents and improved classroom participation');
        }

        return predictions;
    }

    /**
     * Generate weekly improvement plan
     */
    generateWeeklyPlan(iep: IEPDocument, weekNumber: number): WeeklyPlan {
        const activeGoals = iep.goals.filter(g => g.status === 'in-progress' || g.status === 'not-started');

        return {
            week: weekNumber,
            focus: activeGoals[0]?.description || 'General skill development',
            activities: [
                'Daily practice sessions (15-20 minutes)',
                'Interactive learning games',
                'Progress assessment',
                'Parent communication and home practice'
            ],
            goals: activeGoals.slice(0, 2).map(g => g.measurableObjective),
            expectedOutcomes: [
                'Measurable progress toward weekly objectives',
                'Increased confidence and engagement',
                'Data collection for progress monitoring'
            ]
        };
    }

    /**
     * Export IEP to PDF format (metadata for PDF generation)
     */
    exportToPDF(iep: IEPDocument): {
        title: string;
        sections: Array<{ heading: string; content: string }>;
    } {
        return {
            title: `Individualized Education Plan - ${iep.studentName}`,
            sections: [
                {
                    heading: 'Student Information',
                    content: `Name: ${iep.studentName}\nGrade: ${iep.currentLevel}\nAcademic Year: ${iep.academicYear}`
                },
                {
                    heading: 'Disability Categories',
                    content: iep.disabilityCategories.join(', ')
                },
                {
                    heading: 'Present Levels of Performance',
                    content: `Strengths: ${iep.strengths.join(', ')}\n\nAreas of Concern: ${iep.areasOfConcern.join(', ')}\n\n${iep.currentPerformance}`
                },
                {
                    heading: 'Goals and Objectives',
                    content: iep.goals.map((g, i) =>
                        `${i + 1}. ${g.description}\n   Objective: ${g.measurableObjective}\n   Target: ${g.targetDate.toLocaleDateString()}`
                    ).join('\n\n')
                },
                {
                    heading: 'Services and Accommodations',
                    content: `Special Education Services:\n${iep.specialEducationServices.map(s => `• ${s}`).join('\n')}\n\nRelated Services:\n${iep.relatedServices.map(s => `• ${s}`).join('\n')}\n\nAccommodations:\n${iep.accommodations.map(a => `• ${a}`).join('\n')}`
                },
                {
                    heading: 'AI Recommendations',
                    content: iep.aiRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
                },
                {
                    heading: 'Predicted Outcomes',
                    content: iep.predictedOutcomes.map((p, i) => `${i + 1}. ${p}`).join('\n')
                }
            ]
        };
    }

    // Helper methods

    private getCurrentAcademicYear(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }

    private summarizePerformance(performance: PerformanceData): string {
        const avgScore = Object.values(performance.academicScores).reduce((a, b) => a + b, 0) /
            Object.values(performance.academicScores).length;

        return `Current academic average: ${avgScore.toFixed(1)}%. ` +
            `Attendance rate: ${(performance.attendanceRate * 100).toFixed(1)}%. ` +
            `Assignment completion: ${(performance.assignmentCompletion * 100).toFixed(1)}%. ` +
            `Progress rate: ${(performance.progressRate * 100).toFixed(1)}% improvement over baseline.`;
    }

    private determinePriorityAreas(student: StudentProfile, indicators: DisabilityIndicators): string[] {
        const priorities: Array<{ area: string; score: number }> = [];

        // Analyze academic scores
        Object.entries(student.currentPerformance.academicScores).forEach(([subject, score]) => {
            if (score < 70) {
                priorities.push({ area: subject, score: 100 - score });
            }
        });

        // Add disability-related priorities
        if (indicators.dyslexia > 0.5) priorities.push({ area: 'reading', score: indicators.dyslexia * 100 });
        if (indicators.adhd > 0.5) priorities.push({ area: 'focus and attention', score: indicators.adhd * 100 });
        if (indicators.speechDelay > 0.5) priorities.push({ area: 'communication', score: indicators.speechDelay * 100 });

        // Sort by score (higher = more priority)
        priorities.sort((a, b) => b.score - a.score);

        return priorities.slice(0, 5).map(p => p.area);
    }

    private generateStrategies(area: string): string[] {
        const strategies: Record<string, string[]> = {
            reading: [
                'Multi-sensory phonics instruction',
                'Repeated reading for fluency',
                'Vocabulary building exercises',
                'Comprehension strategy instruction'
            ],
            math: [
                'Concrete manipulatives for concept building',
                'Visual models and diagrams',
                'Step-by-step problem-solving strategies',
                'Real-world application examples'
            ],
            writing: [
                'Graphic organizers for planning',
                'Sentence frames and templates',
                'Peer editing and feedback',
                'Technology-assisted writing tools'
            ],
            'focus and attention': [
                'Break tasks into smaller steps',
                'Use timers and visual schedules',
                'Provide movement breaks',
                'Minimize distractions'
            ],
            communication: [
                'Model correct speech patterns',
                'Provide wait time for responses',
                'Use visual supports',
                'Practice in low-pressure settings'
            ]
        };

        return strategies[area.toLowerCase()] || [
            'Individualized instruction',
            'Frequent practice opportunities',
            'Positive reinforcement',
            'Progress monitoring'
        ];
    }

    private generateGoalAccommodations(area: string): string[] {
        return [
            'Extended time as needed',
            'Assistive technology',
            'Modified materials',
            'Preferential seating',
            'Frequent breaks'
        ];
    }

    private determineAssessmentMethods(indicators: DisabilityIndicators): string[] {
        const methods = [
            'Curriculum-based measurements',
            'Teacher observations',
            'Work samples and portfolios',
            'Progress monitoring probes'
        ];

        if (indicators.dyslexia > 0.5) {
            methods.push('Reading fluency assessments');
        }

        if (indicators.adhd > 0.5) {
            methods.push('Behavioral tracking charts');
        }

        return methods;
    }
}

export const iepGeneratorService = new IEPGeneratorService();
