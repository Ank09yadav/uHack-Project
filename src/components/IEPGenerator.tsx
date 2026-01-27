"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Target, Brain, Award, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface IEPData {
    studentName: string;
    strengths: string[];
    weaknesses: string[];
    goals: {
        shortTerm: string[];
        longTerm: string[];
    };
    recommendedTools: string[];
    progressScore: number;
}

export const IEPGenerator: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [iepReport, setIepReport] = useState<IEPData | null>(null);

    const generateIEP = async () => {
        setIsGenerating(true);
        setTimeout(() => {
            const mockIEP: IEPData = {
                studentName: "Current Student",
                strengths: ["Visual pattern recognition", "Persistence in problem solving", "Sign language vocabulary"],
                weaknesses: ["Auditory processing speed", "Long-form text comprehension", "Focus retention beyond 15 mins"],
                goals: {
                    shortTerm: ["Complete 3 visual learning modules", "Achieve 80% on next 2 sign language quizzes"],
                    longTerm: ["Improve reading speed by 20%", "Master basic conversational sign language"]
                },
                recommendedTools: ["Text-to-Speech", "Visual Flashcards", "Adaptive Reader (Simplified Mode)"],
                progressScore: 78
            };
            setIepReport(mockIEP);
            setIsGenerating(false);
        }, 1500);
    };

    const downloadPDF = () => {
        if (!iepReport) return;

        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Individualized Education Plan (IEP)", 20, 20);

        doc.setFontSize(16);
        doc.text(`Student: ${iepReport.studentName}`, 20, 35);

        doc.setFontSize(14);
        doc.text("Strengths:", 20, 50);
        iepReport.strengths.forEach((s, i) => doc.text(`- ${s}`, 25, 60 + (i * 10)));

        const weaknessStart = 60 + (iepReport.strengths.length * 10) + 10;
        doc.text("Areas for Improvement:", 20, weaknessStart);
        iepReport.weaknesses.forEach((w, i) => doc.text(`- ${w}`, 25, weaknessStart + 10 + (i * 10)));

        doc.save(`${iepReport.studentName}_IEP.pdf`);
    };

    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI IEP Generator</h2>
                    <p className="text-gray-600">Dynamic Individualized Education Plan based on your learning patterns.</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <FileText size={32} />
                </div>
            </div>

            {!iepReport ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Brain size={64} className="mb-4 text-gray-200" />
                    <p className="mb-8 max-w-sm text-gray-500">
                        Our AI analyzes your reading speed, quiz scores, and attention patterns to create a personalized learning roadmap.
                    </p>
                    <button
                        onClick={generateIEP}
                        disabled={isGenerating}
                        className="flex items-center gap-3 rounded-2xl bg-gray-900 px-8 py-4 font-bold text-white transition-all hover:bg-gray-800 hover:shadow-xl"
                    >
                        {isGenerating ? "Analyzing Patterns..." : "Generate My IEP Report"}
                        <ChevronRight size={20} />
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-green-50 p-6">
                            <div className="mb-4 flex items-center gap-2 text-green-700">
                                <Award size={20} />
                                <span className="font-bold uppercase tracking-wider text-xs">Strengths</span>
                            </div>
                            <ul className="space-y-2">
                                {iepReport.strengths.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-2xl bg-purple-50 p-6">
                            <div className="mb-4 flex items-center gap-2 text-purple-700">
                                <Target size={20} />
                                <span className="font-bold uppercase tracking-wider text-xs">Goals</span>
                            </div>
                            <ul className="space-y-2">
                                {iepReport.goals.shortTerm.map((g, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                        {g}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-gray-200 p-6">
                        <h3 className="mb-4 font-bold text-gray-900">Recommended Adaptive Mode</h3>
                        <div className="flex flex-wrap gap-2">
                            {iepReport.recommendedTools.map((tool, i) => (
                                <span key={i} className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={() => setIepReport(null)}
                            className="text-sm font-bold text-gray-500 hover:text-gray-900"
                        >
                            Reset Analysis
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-700"
                        >
                            <Download size={18} />
                            Download PDF Report
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
