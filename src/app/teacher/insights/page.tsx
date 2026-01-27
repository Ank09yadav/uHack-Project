"use client";

import { useState, useEffect } from 'react';
import { Brain, Eye, Heart, FileText, Users, TrendingUp, Download, AlertCircle } from 'lucide-react';

interface StudentInsight {
    id: string;
    name: string;
    disabilityRisk: number;
    focusScore: number;
    emotionalState: string;
    needsAttention: boolean;
}

export default function TeacherInsightsPage() {
    const [students, setStudents] = useState<StudentInsight[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [view, setView] = useState<'overview' | 'disability' | 'attention' | 'emotion' | 'iep'>('overview');

    useEffect(() => {
        // Mock student data
        setStudents([
            {
                id: '1',
                name: 'Rahul Kumar',
                disabilityRisk: 0.65,
                focusScore: 0.72,
                emotionalState: 'confused',
                needsAttention: true
            },
            {
                id: '2',
                name: 'Priya Sharma',
                disabilityRisk: 0.45,
                focusScore: 0.85,
                emotionalState: 'happy',
                needsAttention: false
            },
            {
                id: '3',
                name: 'Amit Patel',
                disabilityRisk: 0.72,
                focusScore: 0.58,
                emotionalState: 'frustrated',
                needsAttention: true
            },
            {
                id: '4',
                name: 'Sneha Reddy',
                disabilityRisk: 0.38,
                focusScore: 0.91,
                emotionalState: 'excited',
                needsAttention: false
            },
            {
                id: '5',
                name: 'Arjun Singh',
                disabilityRisk: 0.58,
                focusScore: 0.65,
                emotionalState: 'neutral',
                needsAttention: false
            }
        ]);
    }, []);

    const studentsNeedingAttention = students.filter(s => s.needsAttention);
    const avgFocusScore = students.reduce((sum, s) => sum + s.focusScore, 0) / students.length;
    const highRiskStudents = students.filter(s => s.disabilityRisk > 0.6);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                🎓 AI-Powered Teacher Insights
                            </h1>
                            <p className="text-gray-600">
                                Real-time analytics and recommendations for your students
                            </p>
                        </div>
                        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                            <Download className="w-5 h-5" />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        label="Total Students"
                        value={students.length}
                        color="blue"
                    />
                    <StatCard
                        icon={<AlertCircle className="w-6 h-6" />}
                        label="Need Attention"
                        value={studentsNeedingAttention.length}
                        color="red"
                        highlight
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Avg Focus Score"
                        value={`${Math.round(avgFocusScore * 100)}%`}
                        color="green"
                    />
                    <StatCard
                        icon={<Brain className="w-6 h-6" />}
                        label="High Risk"
                        value={highRiskStudents.length}
                        color="yellow"
                    />
                </div>

                {/* View Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <TabButton
                            active={view === 'overview'}
                            onClick={() => setView('overview')}
                            icon={<Users className="w-4 h-4" />}
                            label="Overview"
                        />
                        <TabButton
                            active={view === 'disability'}
                            onClick={() => setView('disability')}
                            icon={<Brain className="w-4 h-4" />}
                            label="Disability Detection"
                        />
                        <TabButton
                            active={view === 'attention'}
                            onClick={() => setView('attention')}
                            icon={<Eye className="w-4 h-4" />}
                            label="Attention Analytics"
                        />
                        <TabButton
                            active={view === 'emotion'}
                            onClick={() => setView('emotion')}
                            icon={<Heart className="w-4 h-4" />}
                            label="Emotional Insights"
                        />
                        <TabButton
                            active={view === 'iep'}
                            onClick={() => setView('iep')}
                            icon={<FileText className="w-4 h-4" />}
                            label="IEP Management"
                        />
                    </div>

                    {/* Content */}
                    {view === 'overview' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Overview</h2>

                            {/* Priority Students */}
                            {studentsNeedingAttention.length > 0 && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                                    <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Students Needing Immediate Attention
                                    </h3>
                                    <div className="space-y-2">
                                        {studentsNeedingAttention.map(student => (
                                            <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded">
                                                <span className="font-medium text-gray-900">{student.name}</span>
                                                <div className="flex gap-2">
                                                    <span className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded">
                                                        Risk: {Math.round(student.disabilityRisk * 100)}%
                                                    </span>
                                                    <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                                        {student.emotionalState}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Students Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Disability Risk</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Focus Score</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Emotional State</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <RiskBadge risk={student.disabilityRisk} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <FocusBadge score={student.focusScore} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <EmotionBadge emotion={student.emotionalState} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => setSelectedStudent(student.id)}
                                                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                                                    >
                                                        View Details →
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'disability' && (
                        <DisabilityInsightsView students={students} />
                    )}

                    {view === 'attention' && (
                        <AttentionInsightsView students={students} />
                    )}

                    {view === 'emotion' && (
                        <EmotionInsightsView students={students} />
                    )}

                    {view === 'iep' && (
                        <IEPManagementView students={students} />
                    )}
                </div>
            </div>
        </div>
    );
}

// Component implementations

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: 'blue' | 'red' | 'green' | 'yellow';
    highlight?: boolean;
}

function StatCard({ icon, label, value, color, highlight }: StatCardProps) {
    const colors: Record<'blue' | 'red' | 'green' | 'yellow', string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    };

    return (
        <div className={`p-4 rounded-lg border ${colors[color]} ${highlight ? 'ring-2 ring-red-500' : ''}`}>
            <div className="flex items-center justify-between mb-2">
                {icon}
                <span className="text-2xl font-bold">{value}</span>
            </div>
            <p className="text-sm font-medium">{label}</p>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${active
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function RiskBadge({ risk }: { risk: number }) {
    const percentage = Math.round(risk * 100);
    const color = risk > 0.6 ? 'red' : risk > 0.4 ? 'yellow' : 'green';
    const colors = {
        red: 'bg-red-100 text-red-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        green: 'bg-green-100 text-green-700'
    };

    return (
        <span className={`text-sm px-2 py-1 rounded ${colors[color]}`}>
            {percentage}%
        </span>
    );
}

function FocusBadge({ score }: { score: number }) {
    const percentage = Math.round(score * 100);
    const color = score > 0.7 ? 'green' : score > 0.5 ? 'yellow' : 'red';
    const colors = {
        red: 'bg-red-100 text-red-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        green: 'bg-green-100 text-green-700'
    };

    return (
        <span className={`text-sm px-2 py-1 rounded ${colors[color]}`}>
            {percentage}%
        </span>
    );
}

function EmotionBadge({ emotion }: { emotion: string }) {
    const emoji = {
        happy: '😊',
        excited: '🤩',
        neutral: '😐',
        confused: '😕',
        frustrated: '😤',
        sad: '😢',
        anxious: '😰',
        bored: '😴'
    }[emotion] || '😐';

    return (
        <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {emoji} {emotion}
        </span>
    );
}

function DisabilityInsightsView({ students }: { students: StudentInsight[] }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Disability Detection Insights</h2>
            <p className="text-gray-600">AI-powered early detection of learning difficulties</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {students.filter(s => s.disabilityRisk > 0.5).map(student => (
                    <div key={student.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">{student.name}</h3>
                        <p className="text-sm text-gray-700 mb-3">
                            Detection confidence: {Math.round(student.disabilityRisk * 100)}%
                        </p>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900">Recommendations:</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Enable text-to-speech for reading materials</li>
                                <li>• Provide extra time for assignments</li>
                                <li>• Use multi-sensory learning approaches</li>
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AttentionInsightsView({ students }: { students: StudentInsight[] }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Attention & Engagement Analytics</h2>
            <p className="text-gray-600">Real-time focus monitoring and engagement metrics</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {students.map(student => (
                    <div key={student.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">{student.name}</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-600">Focus Score</p>
                                <div className="h-2 bg-gray-100 rounded-full mt-1">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${student.focusScore * 100}%` }}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-700">
                                {student.focusScore > 0.7 ? '✅ Highly engaged' :
                                    student.focusScore > 0.5 ? '⚠️ Moderate focus' :
                                        '❌ Needs support'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmotionInsightsView({ students }: { students: StudentInsight[] }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Emotional State Monitoring</h2>
            <p className="text-gray-600">Track student emotions and provide empathetic support</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {students.map(student => (
                    <div key={student.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{student.name}</h3>
                            <EmotionBadge emotion={student.emotionalState} />
                        </div>
                        <p className="text-sm text-gray-700">
                            {student.emotionalState === 'frustrated' && '💪 Provide encouragement and simplify content'}
                            {student.emotionalState === 'confused' && '💡 Offer additional examples and explanations'}
                            {student.emotionalState === 'happy' && '🎉 Student is engaged and enjoying learning'}
                            {student.emotionalState === 'excited' && '🚀 Channel enthusiasm into learning activities'}
                            {student.emotionalState === 'neutral' && '👍 Student is calm and focused'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function IEPManagementView({ students }: { students: StudentInsight[] }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">IEP Management</h2>
            <p className="text-gray-600">AI-generated Individualized Education Plans</p>

            <div className="space-y-3 mt-4">
                {students.filter(s => s.disabilityRisk > 0.5).map(student => (
                    <div key={student.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{student.name}</h3>
                                <p className="text-sm text-gray-600">Last updated: Today</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                                    View IEP
                                </button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
