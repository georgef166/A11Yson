"use client";

import { useEffect, useState } from "react";
import { User, Settings, Image as ImageIcon, Palette, Volume2 } from "lucide-react";
import Link from 'next/link';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  // Separate state for active preferences to allow toggling
  const [preferences, setPreferences] = useState({
    theme: 'default',
    images: 'allowed',
    tts: false
  });

  useEffect(() => {
    // Load profile from local storage (simulating persistence)
    const stored = localStorage.getItem("a11yson_profile");
    if (stored) {
      const data = JSON.parse(stored);
      setProfile(data);
      // Initialize preferences from AI suggestions
      setPreferences({
        theme: data.suggested_preferences.theme || 'default',
        images: data.suggested_preferences.images || 'allowed',
        tts: false // Default to off, or infer from somewhere else
      });
    }
  }, []);

  const togglePreference = (key: string) => {
    setPreferences(prev => {
      const newVal = { ...prev };
      if (key === 'images') {
        newVal.images = prev.images === 'blocked' ? 'allowed' : 'blocked';
      } else if (key === 'theme') {
         // Simple toggle for prototype
        newVal.theme = prev.theme === 'default' ? 'high-contrast' : 'default';
      } else if (key === 'tts') {
        // @ts-ignore
        newVal.tts = !prev.tts;
      }
      return newVal;
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Profile Found</h1>
          <p className="text-neutral-400">Take the quiz to personalize your experience.</p>
          <Link href="/quiz" className="inline-block px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-500">
            Start Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="text-neutral-400 mt-2">Here is your cognitive accessibility profile.</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xl font-bold">
            A
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-1 md:col-span-2 bg-white/5 rounded-3xl p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold">Cognitive Profile</h2>
            </div>
            
            <div className="space-y-4">
              {profile.suggested_issues.map((issue: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{issue.name}</h3>
                    <p className="text-neutral-400 text-sm mt-1">{issue.description}</p>
                  </div>
                </div>
              ))}
              {profile.suggested_issues.length === 0 && (
                <p className="text-neutral-500 italic">No specific issues detected based on quiz answers.</p>
              )}
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold">Preferences</h2>
            </div>

            <div className="space-y-6">
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-neutral-400" />
                  <span>Theme Contrast</span>
                </div>
                <button 
                  onClick={() => togglePreference('theme')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.theme !== 'default' ? 'bg-purple-600' : 'bg-neutral-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.theme !== 'default' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Image Blocking Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-neutral-400" />
                  <span>Image Blocking</span>
                </div>
                <button 
                  onClick={() => togglePreference('images')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.images === 'blocked' ? 'bg-purple-600' : 'bg-neutral-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.images === 'blocked' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* TTS Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-neutral-400" />
                  <span>Auto-TTS</span>
                </div>
                <button 
                  // @ts-ignore
                  onClick={() => togglePreference('tts')}
                  // @ts-ignore
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.tts ? 'bg-purple-600' : 'bg-neutral-700'}`}
                >
                   {/* @ts-ignore */}
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.tts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
