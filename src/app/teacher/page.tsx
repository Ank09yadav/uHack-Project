"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    TrendingUp,
    BookOpen,
    Award,
    Calendar,
    MessageSquare,
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    X,
    Plus,
    XCircle
} from 'lucide-react';
import Link from 'next/link';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IEPGenerator } from '@/components/IEPGenerator';

const recentActivityMock: any[] = [];
const upcomingAssignmentsMock: any[] = [];

export default function TeacherDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [students, setStudents] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    React.useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || ((session.user as any).role !== 'teacher' && (session.user as any).role !== 'admin')) {
            router.push('/auth');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/teacher');
                const data = await res.json();
                setStudents(data.students || []);
                setActivities(data.recentActivity || []);
                setAssignments(data.upcomingAssignments || []);
            } catch (error) {
                console.error("Failed to fetch teacher data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, status, router]);

    const handleAddStudent = async (newStudent: { name: string; email: string; initialProgress?: number }) => {
        try {
            const res = await fetch('/api/dashboard/teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStudent),
            });
            const data = await res.json();
            if (data.success) {
                setStudents([...students, data.student]);
                setShowAddModal(false);
            }
        } catch (error) {
            console.error("Failed to add student", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                    <p className="text-gray-600">Loading classroom data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-10">
            <Navbar />

            <div className="fixed top-20 left-10 -z-10 h-72 w-72 rounded-full bg-blue-100/50 blur-[100px]" />
            <div className="fixed top-40 right-10 -z-10 h-72 w-72 rounded-full bg-purple-100/50 blur-[100px]" />


            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Teacher Dashboard</h1>
                        <p className="text-lg text-gray-600 mt-2">Manage your students and track their progress</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all">
                            <Clock size={16} />
                            Schedule
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all"
                        >
                            <Plus size={16} />
                            Add Student
                        </button>
                    </div>
                </motion.div>

                {!selectedStudent && (
                    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<Users className="text-blue-600" size={24} />}
                            label="Total Students"
                            value={students.length.toString()}
                            change="+3 this month"
                            positive
                        />
                        <StatCard
                            icon={<TrendingUp className="text-green-600" size={24} />}
                            label="Avg. Progress"
                            value={`${Math.round(students.reduce((acc, s) => acc + s.progress, 0) / (students.length || 1))}%`}
                            change="+5% from last week"
                            positive
                        />
                        <StatCard
                            icon={<BookOpen className="text-purple-600" size={24} />}
                            label="Modules Assigned"
                            value="12"
                            change="3 active"
                        />
                        <StatCard
                            icon={<Award className="text-yellow-600" size={24} />}
                            label="Achievements"
                            value="156"
                            change="+24 this week"
                            positive
                        />
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        {selectedStudent ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <X size={16} /> Back to Class Overview
                                </button>

                                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white shadow-xl">
                                            {selectedStudent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900">{selectedStudent.name}</h2>
                                            <p className="text-gray-500">{selectedStudent.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-3 mb-8">
                                        <div className="rounded-2xl bg-gray-50 p-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Progress</div>
                                            <div className="text-2xl font-bold text-gray-900">{selectedStudent.progress}%</div>
                                        </div>
                                        <div className="rounded-2xl bg-gray-50 p-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Modules</div>
                                            <div className="text-2xl font-bold text-gray-900">{selectedStudent.modules}</div>
                                        </div>
                                        <div className="rounded-2xl bg-gray-50 p-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                                            <div className="text-2xl font-bold text-green-600 capitalize">{selectedStudent.status}</div>
                                        </div>
                                    </div>

                                    <IEPGenerator />
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <div className="rounded-3xl border border-gray-100 bg-white shadow-xl p-8">
                                    <div className="mb-6 flex items-center justify-between">
                                        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                            My Students
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        {students.length === 0 ? (
                                            <div className="text-center py-10 text-gray-500">
                                                No students found. Add one to get started.
                                            </div>
                                        ) : (
                                            students.map((student) => (
                                                <motion.div
                                                    key={student.id}
                                                    whileHover={{ scale: 1.01 }}
                                                    className="cursor-pointer group rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-gray-200"
                                                    onClick={() => setSelectedStudent(student)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-md">
                                                                        {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</div>
                                                                        <div className="text-sm text-gray-500">{student.modules} modules • {student.lastActive}</div>
                                                                    </div>
                                                                </div>
                                                                <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${student.status === 'active'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {student.status}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1">
                                                                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                        <span>Progress</span>
                                                                        <span className="text-blue-600">{student.progress}%</span>
                                                                    </div>
                                                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                                                        <motion.div
                                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${student.progress}%` }}
                                                                            transition={{ duration: 1 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )))}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-gray-100 bg-white shadow-xl p-8">
                                    <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                                        Recent Activity
                                    </h2>
                                    <div className="space-y-4">
                                        {activities.length === 0 ? <p className="text-gray-500">No recent activity.</p> :
                                            activities.map((activity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50/30 p-4"
                                                >
                                                    <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full shadow-sm ${activity.type === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                                                        }`}>
                                                        {activity.type === 'success' ? (
                                                            <CheckCircle className="text-green-600" size={18} />
                                                        ) : (
                                                            <AlertCircle className="text-yellow-600" size={18} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{activity.student}</div>
                                                        <div className="text-sm text-gray-600 mb-1">{activity.action}</div>
                                                        <div className="text-xs text-gray-400 font-medium">{activity.time}</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl p-6">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900 uppercase tracking-widest text-opacity-80">
                                Performance
                            </h2>
                            <div className="space-y-6">
                                <PerformanceMetric label="Average Score" value="78%" color="blue" />
                                <PerformanceMetric label="Completion Rate" value="85%" color="green" />
                                <PerformanceMetric label="Engagement" value="92%" color="purple" />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl p-6">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900 uppercase tracking-widest text-opacity-80">
                                Upcoming
                            </h2>
                            <div className="space-y-4">
                                {assignments.length === 0 ? <p className="text-gray-500 text-sm">No upcoming assignments.</p> :
                                    assignments.map((assignment, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:shadow-sm"
                                        >
                                            <div className="mb-2 font-bold text-gray-900">{assignment.title}</div>
                                            <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                                                <span className="bg-white px-2 py-1 rounded border border-gray-200">Due: {assignment.dueDate}</span>
                                                <span>{assignment.students} students</span>
                                                {assignment.score && <span className="text-green-600">Score: {assignment.score}</span>}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <button className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all">
                                Create Assignment
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <AddStudentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddStudent}
            />
        </div>
    );
}

function AddStudentModal({ isOpen, onClose, onAdd }: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (student: { name: string; email: string; initialProgress?: number }) => void;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            setError('Please fill in all required fields');
            return;
        }
        onAdd({
            name,
            email,
            initialProgress: progress ? parseInt(progress) : 0
        });
        setName('');
        setEmail('');
        setProgress('');
        setError('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 shadow-2xl"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">Add New Student</h3>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="Enter student name"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="student@example.com"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700">
                                    Initial Progress (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(e) => setProgress(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all"
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function StatCard({ icon, label, value, change, positive }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl hover:shadow-2xl transition-shadow"
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">{value}</div>
            <div className="text-sm font-medium text-gray-500">{label}</div>
            {change && (
                <div className={`mt-3 flex items-center gap-1 text-xs font-bold ${positive ? 'text-green-600' : 'text-gray-400'}`}>
                    {positive ? <TrendingUp size={14} /> : null}
                    {change}
                </div>
            )}
        </motion.div>
    );
}

function PerformanceMetric({ label, value, color }: {
    label: string;
    value: string;
    color: string;
}) {
    const percentage = parseInt(value);

    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                    className={`h-full bg-${color}-500`}
                    style={{ width: `${percentage}%`, backgroundColor: color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#8b5cf6' }}
                />
            </div>
        </div>
    );
}
