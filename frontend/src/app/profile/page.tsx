"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Presets Configuration
const PRESETS: Record<string, any> = {
  "ADHD": {
    recommended_font: "Inter",
    contrast_preference: "dark-mode",
    content_density: "chunked",
    features: { bionic_reading: true, image_hiding: false, tts_enabled: true, reduce_motion: false }
  },
  "Dyslexia": {
    recommended_font: "OpenDyslexic",
    contrast_preference: "soft-yellow",
    content_density: "comfortable",
    features: { bionic_reading: false, image_hiding: false, tts_enabled: true, reduce_motion: false }
  },
  "Sensory": {
    recommended_font: "Inter",
    contrast_preference: "dark-mode",
    content_density: "comfortable",
    features: { bionic_reading: false, image_hiding: true, tts_enabled: false, reduce_motion: true }
  },
  "Clean": {
    recommended_font: "Inter",
    contrast_preference: "default",
    content_density: "comfortable",
    features: { bionic_reading: false, image_hiding: false, tts_enabled: false, reduce_motion: false }
  }
};

export default function ProfilePage() {
  const [profileState, setProfileState] = useState<any>(null);
  const [originalProfile, setOriginalProfile] = useState<any>(null); // Store the initial AI result
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState<string>("recommended"); // Track active selection

  // Initialize editable state from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("a11yson_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfileState(parsed);
        setOriginalProfile(parsed);
        setActivePreset("recommended");
      } catch (e) { console.error(e); }
    } else {
      // Default Fallback
      const fallback = {
        primary_condition: "Clean",
        recommended_font: "Inter",
        contrast_preference: "default",
        content_density: "comfortable",
        features: { bionic_reading: false, image_hiding: false, tts_enabled: false, reduce_motion: false },
        explanation: "Standard clean profile."
      };
      setProfileState(fallback);
      setOriginalProfile(fallback);
      setActivePreset("Clean");
    }
    setLoading(false);
  }, []);

  const applyRecommended = () => {
    if (!originalProfile) return;
    setProfileState({ ...originalProfile });
    setActivePreset("recommended");
  };

  const applyPreset = (presetName: string) => {
    if (!profileState) return;
    const preset = PRESETS[presetName];
    setProfileState({
      ...profileState, // Keep explanation if we want? Or overwrite? 
      // Actually, standard behavior is to replace settings.
      primary_condition: presetName,
      recommended_font: preset.recommended_font,
      contrast_preference: preset.contrast_preference,
      content_density: preset.content_density,
      features: { ...preset.features }
    });
    setActivePreset(presetName);
  };

  const toggleFeature = (key: string) => {
    if (!profileState) return;
    setProfileState({
      ...profileState,
      features: {
        ...profileState.features,
        [key]: !profileState.features[key]
      }
    });
    // If user toggles manually, they are technically in "custom" mode, 
    // but we can leave the active highlight on the last selected preset or plain.
    // For now, let's keep it simple.
  };

  if (loading) return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        Loading Profile...
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">

      <Header />

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">

        <div className="w-full max-w-5xl animate-fade-in-up bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row h-auto md:h-[600px]">

          {/* LEFT SIDEBAR - PRESETS */}
          <div className="w-full md:w-1/3 bg-zinc-100 dark:bg-zinc-950 p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-1">Welcome, George</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Select a Preset</p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">

              {/* RECOMMENDED BUTTON */}
              <button
                onClick={applyRecommended}
                className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center justify-between group border-2 ${activePreset === "recommended"
                  ? 'bg-indigo-600 text-white shadow-md border-indigo-600'
                  : 'bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-indigo-100 dark:border-indigo-900/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">Recommended</span>
                </div>
                {activePreset === "recommended" && (
                  <span className="bg-white/20 p-1 rounded-full"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>
                )}
              </button>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center justify-between group ${activePreset === name
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                >
                  <span className="font-bold text-lg">{name}</span>
                  {activePreset === name && (
                    <span className="bg-white/20 p-1 rounded-full"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-400">Selecting a preset adjusts all settings on the right instantly.</p>
            </div>
          </div>

          {/* RIGHT PANEL - TOGGLES */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">

            {/* AI RECOMMENDATION SECTION */}
            {profileState.explanation && (
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="text-6xl">🤖</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">✨</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Recommended for You</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {profileState.explanation}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Custom Settings</h3>
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-mono text-zinc-500">{profileState.primary_condition} Mode</span>
            </div>

            {/* VISUAL SETTINGS */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Visual & Typography</h4>

              <div className="space-y-4">
                {/* Font Toggle */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center font-serif text-xl border border-zinc-200 dark:border-zinc-700">Aa</div>
                    <div>
                      <div className="font-semibold">Dyslexia Font</div>
                      <div className="text-xs text-zinc-500">Use OpenDyslexic for better readability</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileState({ ...profileState, recommended_font: profileState.recommended_font === "OpenDyslexic" ? "Inter" : "OpenDyslexic" })}
                    className={`w-14 h-8 rounded-full transition-colors relative ${profileState.recommended_font === "OpenDyslexic" ? 'bg-blue-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${profileState.recommended_font === "OpenDyslexic" ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white border border-zinc-200">🌙</div>
                    <div>
                      <div className="font-semibold">Dark Mode</div>
                      <div className="text-xs text-zinc-500">High contrast dark theme</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileState({ ...profileState, contrast_preference: profileState.contrast_preference === "dark-mode" ? "default" : "dark-mode" })}
                    className={`w-14 h-8 rounded-full transition-colors relative ${profileState.contrast_preference === "dark-mode" ? 'bg-blue-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${profileState.contrast_preference === "dark-mode" ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                {/* Hide Images */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xl">🖼️</div>
                    <div>
                      <div className="font-semibold">Hide Images</div>
                      <div className="text-xs text-zinc-500">Remove visual distractions</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature('image_hiding')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${profileState.features.image_hiding ? 'bg-blue-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${profileState.features.image_hiding ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* COGNITIVE SETTINGS */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Cognitive Support</h4>
              <div className="space-y-4">
                {/* Bionic */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">Bio</div>
                    <div>
                      <div className="font-semibold">Bionic Reading</div>
                      <div className="text-xs text-zinc-500">Highlight initial letters of words</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature('bionic_reading')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${profileState.features.bionic_reading ? 'bg-blue-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${profileState.features.bionic_reading ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* TTS */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl">🔊</div>
                    <div>
                      <div className="font-semibold">Text-to-Speech Enabled</div>
                      <div className="text-xs text-zinc-500">Allow reading selected text aloud</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature('tts_enabled')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${profileState.features.tts_enabled ? 'bg-blue-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${profileState.features.tts_enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}

          </div>
        </div>

        {/* Action Buttons - Separate Box Below */}
        <div className="w-full max-w-5xl mt-6 flex gap-4">
          <button
            onClick={() => {
              const btn = document.getElementById('sync-btn');
              if (btn) btn.innerText = "Cruising... 🚀";

              window.postMessage({ type: "A11YSON_PROFILE_UPDATE", profile: profileState }, "*");
              localStorage.setItem("a11yson_profile", JSON.stringify(profileState));

              setTimeout(() => {
                if (btn) btn.innerText = "Synced! ✅";
                setTimeout(() => { if (btn) btn.innerText = "Sync Changes to Extension"; }, 2000);
              }, 1000);
            }}
            id="sync-btn"
            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all shadow-md"
          >
            Sync Changes to Extension
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText("chrome://extensions");
              alert("Browser security prevents opening this page directly.\n\nCopied 'chrome://extensions' to your clipboard! \n\nPlease open a new tab and paste it to manage your extensions.");
            }}
            className="px-6 py-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all text-center shadow-md flex items-center justify-center cursor-pointer"
          >
            Go to Chrome Store
          </button>

          <Link href="/" className="px-8 py-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-center shadow-md">
            Done
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
