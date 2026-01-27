"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { AskAI } from '@/components/AskAI';
import { SpeechToTextInput } from '@/components/SpeechToTextInput';
import { TextToSpeechButton } from '@/components/TextToSpeechButton';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Mic,
  Volume2,
  Brain,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Heart,
  Zap,
  Globe,
  Layers,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { useSession } from 'next-auth/react';


export default function Home() {
  const { t } = useTranslation();
  const [transcript, setTranscript] = React.useState('');
  const { data: session } = useSession();
  const user = session?.user;

  const features = [
    {
      icon: <Mic className="text-white" size={24} />,
      title: t('features.stt.title'),
      description: t('features.stt.description'),
      color: "bg-blue-500"
    },
    {
      icon: <Volume2 className="text-white" size={24} />,
      title: t('features.tts.title'),
      description: t('features.tts.description'),
      color: "bg-purple-500"
    },
    {
      icon: <Brain className="text-white" size={24} />,
      title: t('features.ai.title'),
      description: t('features.ai.description'),
      color: "bg-green-500"
    },
    {
      icon: <Globe className="text-white" size={24} />,
      title: t('features.voice.title'),
      description: t('features.voice.description'),
      color: "bg-pink-500"
    }
  ];

  const demoContent = "EduAccess makes learning accessible for everyone, regardless of abilities.";

  return (
    <div className="min-h-screen bg-[#FDFDFD] overflow-x-hidden selection:bg-purple-200">
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-purple-100/50 blur-[100px]" />
      <div className="absolute top-40 left-[-200px] -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-[80px]" />

      <Navbar />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6 lg:px-8">

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm">
              <Sparkles size={16} className="text-purple-500" />
              <span>{t('home.title')}</span>
            </div>
            <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Learning without <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                Boundaries.
              </span>
            </h1>
            <p className="mb-8 text-xl text-gray-600 leading-relaxed max-w-lg">
              {t('home.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link
                  href={(user as any).role === 'teacher' ? '/teacher' : '/dashboard'}
                  className="flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1"
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link href="/auth" className="flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1">
                  Start Learning
                  <ArrowRight size={18} />
                </Link>
              )}
              <Link href="#features" className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-8 py-4 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition-all">
                View Features
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`, backgroundSize: 'cover' }} />
                ))}
              </div>
              <div>Trusted by 10,000+ students</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl bg-white p-6 shadow-2xl border border-gray-100/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Brain size={20} /></div>
                  <div>
                    <div className="font-bold text-gray-800">My Learning Path</div>
                    <div className="text-xs text-gray-500">Adaptive AI Enabled</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">Level 4</div>
                  <div className="h-1.5 w-24 bg-gray-100 rounded-full mt-1"><div className="h-full w-3/4 bg-green-500 rounded-full" /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="text-blue-800 font-semibold mb-1">Text to Speech</div>
                  <div className="text-xs text-gray-600 mb-3">Active Reading Mode</div>
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-75" />
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-150" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="text-purple-800 font-semibold mb-1">Sign Language</div>
                  <div className="text-xs text-gray-600 mb-2">Camera Active</div>
                  <div className="h-8 w-20 bg-purple-200 rounded animate-pulse" />
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs uppercase tracking-wider">AI Assistant</div>
                <div className="text-sm">"Great job on the quiz! Would you like to practice the next module with voice commands?"</div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 z-20 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3"
            >
              <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={20} /></div>
              <div>
                <div className="font-bold text-gray-900">Streak!</div>
                <div className="text-xs text-gray-500">7 Days in a row</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 z-20 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3"
            >
              <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Award size={20} /></div>
              <div>
                <div className="font-bold text-gray-900">New Badge</div>
                <div className="text-xs text-gray-500">Accessible Learner</div>
              </div>
            </motion.div>
          </motion.div>
        </div>


        <div id="features" className="py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600">The most complete accessible learning platform, designed from the ground up for inclusivity.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <section className="py-12">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 overflow-hidden relative text-white">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Accessibility First</h2>
                <p className="text-gray-300 mb-8 max-w-md">Try our core technologies right here. We believe in tools that just work.</p>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-2 block">Speech to Text</label>
                    <SpeechToTextInput
                      onTranscriptChange={setTranscript}
                      placeholder="Tap mic and speak..."
                      className="max-w-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-2 block">Text to Speech</label>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md max-w-md border border-white/10">
                      <p className="text-sm text-gray-200 flex-1 truncate">{demoContent}</p>
                      <TextToSpeechButton text={demoContent} variant="icon" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 lg:hidden" />
                <div className="grid grid-cols-2 gap-4 opacity-50">
                  <div className="h-40 bg-white/5 rounded-2xl" />
                  <div className="h-40 bg-white/5 rounded-2xl mt-8" />
                  <div className="h-40 bg-white/5 rounded-2xl -mt-8" />
                  <div className="h-40 bg-white/5 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <AccessibilityPanel />
      <AskAI />
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  )
}
