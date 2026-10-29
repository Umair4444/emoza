'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { analyzeEmotion, EmotionState } from '@/lib/emotion';

// Dynamically import Avatar to prevent SSR issues with Three.js
const AvatarCanvas = dynamic(() => import('@/components/Avatar'), { ssr: false });

const PRESET_MESSAGES = [
  { label: '🎉 Excited', text: "I am so incredibly happy and excited about this wonderful day!" },
  { label: '😢 Sad', text: "I feel really sad and lonely today, it hurts so much." },
  { label: '😠 Angry', text: "This is so frustrating and infuriating! I can't stand it!" },
  { label: '😲 Surprised', text: "Oh wow! I never expected this incredible surprise at all!" },
  { label: '😰 Fearful', text: "I'm so nervous and scared about what might happen next..." },
  { label: '🤖 Neutral', text: "Hello there. I am your emotional 3D avatar assistant. How can I help?" }
];

export default function Home() {
  const [text, setText] = useState("Hello! I am your 3D avatar. Type anything or pick a preset to see me resonate with your words!");
  const [emotion, setEmotion] = useState<EmotionState>(() => analyzeEmotion(text));
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setEmotion(analyzeEmotion(text));
  }, [text]);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = emotion.primary === 'joy' ? 1.3 : emotion.primary === 'sad' ? 0.7 : 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 sm:p-12 font-sans">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Emoza 3D</h1>
            <p className="text-xs text-slate-400">Emotion-Responsive 3D Avatar Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: emotion.weights.color }} />
            Mood: <strong className="capitalize text-white">{emotion.primary}</strong>
          </span>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-center">
        {/* Left: 3D Avatar Display */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative group">
            <AvatarCanvas emotion={emotion} isSpeaking={isSpeaking} />
            {isSpeaking && (
              <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Speaking & Resonating...
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl backdrop-blur">
              <span className="text-xs text-slate-400 block">Intensity</span>
              <span className="text-lg font-bold text-indigo-400">{Math.round(emotion.intensity * 100)}%</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl backdrop-blur">
              <span className="text-xs text-slate-400 block">Smile Index</span>
              <span className="text-lg font-bold text-pink-400">{emotion.weights.smile.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl backdrop-blur">
              <span className="text-xs text-slate-400 block">Expression</span>
              <span className="text-lg font-bold text-emerald-400 capitalize">{emotion.primary}</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Text Input */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-md">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Word & Emotion Studio</h2>
            <p className="text-sm text-slate-400">Type any phrasing or choose a preset to watch the avatar's facial structure and mood adapt in real-time.</p>
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_MESSAGES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(preset.text)}
                  className="text-left text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-200 p-2.5 rounded-lg border border-slate-700/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custom Wording</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
              placeholder="Type what you want the avatar to resonate with..."
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSpeak}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Speak & Express Emotion
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center text-xs text-slate-500 border-t border-slate-900 pt-4">
        Emoza • Built with Next.js, React Three Fiber & Three.js
      </footer>
    </div>
  );
}
