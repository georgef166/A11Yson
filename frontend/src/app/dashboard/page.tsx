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

  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'White': return 'bg-white text-neutral-900';
      case 'Light Gray': return 'bg-neutral-200 text-neutral-900';
      case 'Gray': return 'bg-neutral-500 text-white';
      case 'Dark Gray': return 'bg-neutral-800 text-white';
      case 'Black': return 'bg-black text-white';
      case 'Green': return 'bg-green-950 text-green-50'; // Deep green for accessibility/brand
      default: return 'bg-neutral-900 text-white';
    }
  };

  const getCardStyles = (theme: string) => {
    switch (theme) {
      case 'White': return 'bg-neutral-100 border-neutral-200';
      case 'Light Gray': return 'bg-neutral-100 border-neutral-300';
      case 'Gray': return 'bg-neutral-600 border-neutral-500';
      case 'Dark Gray': return 'bg-neutral-900 border-neutral-700';
      case 'Black': return 'bg-neutral-900 border-neutral-800';
      case 'Green': return 'bg-green-900/50 border-green-800';
      default: return 'bg-white/5 border-white/5';
    }
  };

  if (!profile) {
    // ... (keep existing no-profile view logic if needed, but for brevity not confusing replace)
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

  const themeClasses = getThemeStyles(preferences.theme);
  const cardClasses = getCardStyles(preferences.theme);

  return (
    <div className={`min-h-screen transition-colors duration-300 p-8 ${themeClasses}`}>
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className={`mt-2 ${preferences.theme.includes('Gray') || preferences.theme === 'White' ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Here is your cognitive accessibility profile.
            </p>
          </div>
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 text-xl font-bold">
            A
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className={`col-span-1 md:col-span-2 rounded-3xl p-8 border transition-colors duration-300 ${cardClasses}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold">Cognitive Profile</h2>
            </div>
            
            <div className="space-y-4">
              {profile.suggested_issues.map((issue: any, index: number) => (
                <div key={index} className={`flex items-start gap-4 p-4 rounded-2xl ${preferences.theme === 'White' || preferences.theme === 'Light Gray' ? 'bg-white' : 'bg-black/20'}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{issue.name}</h3>
                    <p className={`text-sm mt-1 ${preferences.theme.includes('Gray') && preferences.theme !== 'Dark Gray' ? 'text-neutral-200' : 'text-neutral-500'} dark:text-neutral-400`}>
                      {issue.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences Card */}
          <div className={`rounded-3xl p-8 border transition-colors duration-300 ${cardClasses}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-500">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold">Preferences</h2>
            </div>

            <div className="space-y-8">
              
              {/* Theme Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Palette className={`w-5 h-5 ${preferences.theme.includes('Gray') && preferences.theme !== 'Dark Gray' ? 'text-white' : 'text-neutral-500'}`} />
                  <span>Theme Preference</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {['White', 'Light Gray', 'Gray', 'Dark Gray', 'Black', 'Green'].map((themeName) => (
                    <button
                      key={themeName}
                      onClick={() => setPreferences(prev => ({ ...prev, theme: themeName }))}
                      className={`px-3 py-2 rounded-lg text-sm transition-all border font-medium
                        ${preferences.theme === themeName 
                          ? 'bg-green-600 border-green-500 text-white shadow-lg scale-105' 
                          : 'border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                        }
                        ${(preferences.theme === 'White' || preferences.theme === 'Light Gray') && preferences.theme !== themeName ? 'text-neutral-700' : ''}
                        `}
                    >
                      {themeName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Blocking Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className={`w-5 h-5 ${preferences.theme.includes('Gray') && preferences.theme !== 'Dark Gray' ? 'text-white' : 'text-neutral-500'}`} />
                  <span>Image Blocking</span>
                </div>
                <button 
                  onClick={() => togglePreference('images')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.images === 'blocked' ? 'bg-green-600' : 'bg-neutral-400'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.images === 'blocked' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* TTS Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className={`w-5 h-5 ${preferences.theme.includes('Gray') && preferences.theme !== 'Dark Gray' ? 'text-white' : 'text-neutral-500'}`} />
                  <span>Auto-TTS</span>
                </div>
                <button 
                  // @ts-ignore
                  onClick={() => togglePreference('tts')}
                  // @ts-ignore
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.tts ? 'bg-green-600' : 'bg-neutral-400'}`}
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
