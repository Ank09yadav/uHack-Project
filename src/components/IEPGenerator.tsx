"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Target, Brain, Award, ChevronRight, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface IEPData {
    studentName: string;
    strengths: string[];
    weaknesses: string[];
    learningStyle: string;
    accommodations: string[];
    goals: {
        shortTerm: string[];
        longTerm: string[];
    };
    recommendedTools: string[];
    progressScore: number;
    timeline: { date: string; milestone: string }[];
    accessibilityTips: string[];
    promotionalMessage: string;
}

export const IEPGenerator: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [iepReport, setIepReport] = useState<IEPData | null>(null);

    const generateIEP = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/dashboard/iep');
            if (!res.ok) throw new Error('Failed to generate IEP');
            const data = await res.json();
            setIepReport(data);
        } catch (error) {
            console.error('IEP generation error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPDF = () => {
        if (!iepReport) return;

        const doc = new jsPDF();

        // --- Header Section ---
        doc.setFillColor(79, 70, 229); // Indigo-600
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("Individualized Education Plan (IEP)", 20, 25);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 32);

        // --- Student Summary ---
        doc.setTextColor(31, 41, 55); // Gray-800
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(iepReport.studentName, 20, 55);

        doc.setFontSize(12);
        doc.setTextColor(75, 85, 99); // Gray-600
        doc.setFont("helvetica", "normal");
        doc.text(`Progress Score: ${iepReport.progressScore}%`, 150, 55);
        doc.line(20, 60, 190, 60);

        let y = 75;

        // Helper function for sections
        const addSection = (title: string, content: string | string[], color: [number, number, number]) => {
            doc.setFillColor(color[0], color[1], color[2], 0.1);
            doc.rect(20, y - 5, 170, 8, 'F');

            doc.setTextColor(color[0], color[1], color[2]);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(title, 22, y + 1);

            y += 12;
            doc.setTextColor(55, 65, 81);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            if (Array.isArray(content)) {
                content.forEach(item => {
                    doc.text(`• ${item}`, 25, y);
                    y += 7;
                });
            } else {
                doc.text(content, 25, y);
                y += 10;
            }
            y += 5;
        };

        addSection("Learning Style", iepReport.learningStyle, [37, 99, 235]); // Blue
        addSection("Core Strengths", iepReport.strengths, [22, 163, 74]); // Green
        addSection("Areas for Improvement", iepReport.weaknesses, [147, 51, 234]); // Purple

        if (y > 250) { doc.addPage(); y = 20; }

        addSection("Recommended Accommodations", iepReport.accommodations, [79, 70, 229]); // Indigo

        // --- Timeline Section ---
        if (y > 220) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(31, 41, 55);
        doc.text("Education Roadmap & Timeline", 20, y);
        y += 10;

        iepReport.timeline.forEach((item, i) => {
            doc.setDrawColor(209, 213, 219);
            doc.circle(25, y - 1, 1, 'S');
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(10);
            doc.text(item.date, 32, y);
            doc.setTextColor(31, 41, 55);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(item.milestone, 60, y);
            y += 8;
        });

        // --- Promotional/Footer Section ---
        const footerY = 275;
        doc.setFillColor(249, 250, 251);
        doc.rect(10, footerY - 5, 190, 20, 'F');

        doc.setTextColor(79, 70, 229);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(iepReport.promotionalMessage, 105, footerY + 2, { align: "center" });

        doc.setTextColor(156, 163, 175);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("InclusiveEdu - Your AI partner in accessible education.", 105, footerY + 10, { align: "center" });

        doc.save(`${iepReport.studentName.replace(/\s+/g, '_')}_IEP_Report.pdf`);
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

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
                            <h3 className="mb-4 flex items-center gap-2 font-bold text-blue-900">
                                <Brain size={20} />
                                Learning Style
                            </h3>
                            <div className="text-2xl font-black text-blue-600">{iepReport.learningStyle}</div>
                            <p className="mt-2 text-sm text-blue-700/70 italic">Based on your platform engagement patterns.</p>
                        </div>
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
                            <h3 className="mb-4 flex items-center gap-2 font-bold text-indigo-900">
                                <ShieldCheck size={20} />
                                Recommended Accommodations
                            </h3>
                            <ul className="space-y-2">
                                {iepReport.accommodations.map((a, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-6">
                        <h3 className="mb-6 font-bold text-gray-900">Education Roadmap & Timeline</h3>
                        <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gray-200">
                            {iepReport.timeline.map((item, i) => (
                                <div key={i} className="relative pl-10">
                                    <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white bg-blue-600 shadow-sm" />
                                    <div className="text-sm font-bold text-gray-400">{item.date}</div>
                                    <div className="font-bold text-gray-900">{item.milestone}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-gray-200 p-6">
                        <h3 className="mb-4 font-bold text-gray-900">Adaptive Tool Configuration</h3>
                        <div className="flex flex-wrap gap-2">
                            {iepReport.recommendedTools.map((tool, i) => (
                                <span key={i} className="rounded-full bg-white border border-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-indigo-50 p-6 border border-indigo-100">
                        <h3 className="mb-4 font-bold text-indigo-900 flex items-center gap-2">
                            <ShieldCheck size={20} />
                            Platform Accessibility Tips
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {iepReport.accessibilityTips.map((tip, i) => (
                                <div key={i} className="flex gap-3 text-sm text-indigo-700">
                                    <div className="mt-1 flex-shrink-0">•</div>
                                    {tip}
                                </div>
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
