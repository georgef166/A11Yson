"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import A11yHeader from "@/components/A11yHeader";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

// Presets Configuration
const PRESETS: Record<string, any> = {
  "ADHD": {
    recommended_font: "Inter",
    text_size: "Large",
    contrast_preference: "grayscale",
    content_density: "chunked",
    features: {
      bionic_reading: true,
      image_hiding: false,
      blur_photos: true,
      block_ads: true,
      tts_enabled: true,
      live_assistant: true,
      reduce_motion: false
    }
  },
  "Dyslexia": {
    recommended_font: "Helvetica",
    text_size: "Large",
    contrast_preference: "soft-yellow",
    content_density: "comfortable",
    features: {
      bionic_reading: false,
      image_hiding: false,
      blur_photos: false,
      block_ads: false,
      tts_enabled: true,
      live_assistant: true,
      reduce_motion: false
    }
  },
  "Sensory": {
    recommended_font: "Inter",
    text_size: "Regular",
    contrast_preference: "grayscale",
    content_density: "comfortable",
    features: {
      bionic_reading: false,
      image_hiding: true,
      blur_photos: true,
      block_ads: true,
      tts_enabled: false,
      live_assistant: false,
      reduce_motion: true
    }
  },
  "Clean": {
    recommended_font: "Inter",
    text_size: "Regular",
    contrast_preference: "default",
    content_density: "comfortable",
    features: {
      bionic_reading: false,
      image_hiding: false,
      blur_photos: false,
      block_ads: true,
      tts_enabled: false,
      live_assistant: false,
      reduce_motion: false
    }
  },
  "Custom": {
    recommended_font: "Inter",
    text_size: "Regular",
    contrast_preference: "default",
    content_density: "comfortable",
    features: {
      bionic_reading: false,
      image_hiding: false,
      blur_photos: false,
      block_ads: false,
      tts_enabled: false,
      live_assistant: false,
      reduce_motion: false
    }
  }
};

export default function ProfilePage() {
  const [profileState, setProfileState] = useState<any>(null);
  const [originalProfile, setOriginalProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState<string>("Clean");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // AUTH PROTECTION
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("a11yson_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all new feature keys exist
        if (!parsed.features) parsed.features = {};
        parsed.features = {
          image_hiding: false,
          blur_photos: false,
          block_ads: false,
          tts_enabled: false,
          live_assistant: false,
          ...parsed.features
        };
        setProfileState(parsed);
        setOriginalProfile(parsed);

        const condition = parsed.primary_condition;
        if (PRESETS[condition]) {
          setActivePreset(condition);
        } else {
          setActivePreset("Clean");
        }
      } catch (e) { console.error(e); }
    } else {
      const fallback = {
        primary_condition: "Clean",
        recommended_font: "Inter",
        text_size: "Regular",
        contrast_preference: "default",
        content_density: "comfortable",
        features: {
          bionic_reading: false,
          image_hiding: false,
          blur_photos: false,
          block_ads: false,
          tts_enabled: false,
          live_assistant: false,
          reduce_motion: false
        },
        explanation: "Standard clean profile."
      };
      setProfileState(fallback);
      setOriginalProfile(fallback);
      setActivePreset("Clean");
    }
    setLoading(false);
  }, []);

  const applyPreset = (presetName: string) => {
    if (!profileState) return;
    const preset = PRESETS[presetName];
    setProfileState({
      ...profileState,
      primary_condition: presetName,
      recommended_font: preset.recommended_font,
      text_size: preset.text_size || "Regular",
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
      primary_condition: "Custom", // Any manual change makes it Custom
      features: {
        ...profileState.features,
        [key]: !profileState.features[key]
      }
    });
    setActivePreset("Custom");
  };

  const updateSetting = (key: string, value: string) => {
    setProfileState({
      ...profileState,
      primary_condition: "Custom",
      [key]: value
    });
    setActivePreset("Custom");
  };

  if (loading) return (
    <div className="flex min-h-screen flex-col bg-[#F1F7F2] text-slate-900 font-sans">
      <A11yHeader />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2F7625] border-t-transparent rounded-full animate-spin"></div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F7F2] text-slate-900 font-sans selection:bg-[#2F7625]/20">
      <A11yHeader />

      <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 py-8 md:px-6 flex flex-col md:flex-row gap-8">

        {/* SIDEBAR - PRESETS CARD */}
        <aside className="w-full md:w-[280px] shrink-0">
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 border border-white/50 h-full">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800">Welcome, {user?.displayName?.split(" ")[0] || "User"}</h2>
              <p className="text-sm text-slate-400 font-medium mt-1">Select a preset</p>
            </div>

            <nav className="flex flex-col gap-3">
              {["ADHD", "Dyslexia", "Sensory", "Clean", "Custom"].map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all flex items-center justify-between font-bold text-base group ${activePreset === name
                    ? "bg-[#2F7625] text-white shadow-md border border-[#2F7625]"
                    : "bg-[#F8FAF8] text-slate-600 hover:bg-[#F2F4F2] border border-transparent"
                    }`}
                >
                  <span>{name}</span>
                  {activePreset === name && (
                    <div className="bg-white/20 rounded-full p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <section className="flex-grow">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Webpage Customization</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Select the specific options that suit your needs best</p>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 border border-white/50 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">

              {/* COLUMN 1: COLOUR & TYPOGRAPHY */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-black mb-6 text-slate-800">Colour & Typography</h3>
                  <div className="space-y-4">
                    {/* Font Selection */}
                    <SettingBox label="Font">
                      <select
                        value={profileState.recommended_font}
                        onChange={(e) => updateSetting('recommended_font', e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-slate-600 text-sm cursor-pointer pr-2"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Arial">Arial</option>
                        <option value="Verdana">Verdana</option>
                        <option value="OpenDyslexic">OpenDyslexic</option>
                      </select>
                    </SettingBox>

                    {/* Text Size */}
                    <SettingBox label="Text size">
                      <select
                        value={profileState.text_size || "Regular"}
                        onChange={(e) => updateSetting('text_size', e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-slate-600 text-sm cursor-pointer pr-2"
                      >
                        <option value="Small">Small</option>
                        <option value="Regular">Regular</option>
                        <option value="Large">Large</option>
                        <option value="Extra Large">Extra Large</option>
                      </select>
                    </SettingBox>

                    {/* Grayscale Mode */}
                    <ToggleSetting
                      label="Grayscale"
                      active={profileState.contrast_preference === "grayscale"}
                      onToggle={() => updateSetting('contrast_preference', profileState.contrast_preference === "grayscale" ? "default" : "grayscale")}
                    />
                  </div>
                </div>

                {/* A11Yson Settings */}
                <div>
                  <h3 className="text-lg font-black mb-6 text-slate-800">A11Yson Settings</h3>
                  <div className="space-y-4">
                    <ToggleSetting
                      label="Text-to-speech"
                      active={profileState.features.tts_enabled}
                      onToggle={() => toggleFeature('tts_enabled')}
                    />
                    <ToggleSetting
                      label="Live Assistant"
                      active={profileState.features.live_assistant}
                      onToggle={() => toggleFeature('live_assistant')}
                    />
                  </div>
                </div>
              </div>

              {/* COLUMN 2: MEDIA & SYNC */}
              <div className="flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-lg font-black mb-6 text-slate-800">Media</h3>
                  <div className="space-y-4">
                    <ToggleSetting
                      label="Hide photos entirely"
                      active={profileState.features.image_hiding}
                      onToggle={() => toggleFeature('image_hiding')}
                    />
                    <ToggleSetting
                      label="Blur photos"
                      active={profileState.features.blur_photos}
                      onToggle={() => toggleFeature('blur_photos')}
                    />
                    <ToggleSetting
                      label="Block ads"
                      active={profileState.features.block_ads}
                      onToggle={() => toggleFeature('block_ads')}
                    />
                  </div>
                </div>

                {/* SYNC BUTTON */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      const btn = document.getElementById('sync-btn');
                      if (btn) btn.innerText = "Syncing...";
                      window.postMessage({ type: "A11YSON_PROFILE_UPDATE", profile: profileState }, "*");
                      localStorage.setItem("a11yson_profile", JSON.stringify(profileState));
                      setTimeout(() => {
                        if (btn) btn.innerText = "Synced! ✅";
                        setTimeout(() => { if (btn) btn.innerText = "Sync Changes to Extension"; }, 2000);
                      }, 800);
                    }}
                    id="sync-btn"
                    className="w-full bg-[#2F7625] text-white py-4 px-6 rounded-2xl font-black text-lg hover:bg-[#206015] transition-all shadow-lg active:scale-[0.98]"
                  >
                    Sync Changes to Extension
                  </button>
                </div>
              </div>

            </div>

            {/* AI Explanation */}
            {profileState.explanation && (
              <div className="mt-10 p-6 bg-[#F8FAF8] rounded-2xl border border-[#2F7625]/5 italic text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2 mb-2 not-italic">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2F7625]">AI Rationale</span>
                </div>
                "{profileState.explanation}"
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SettingBox({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#F8FAF8] rounded-2xl border border-white">
      <span className="text-base font-black text-slate-800">{label}</span>
      <div className="bg-white px-3 py-1.5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center">
        {children}
      </div>
    </div>
  );
}

function ToggleSetting({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#F8FAF8] rounded-2xl border border-white">
      <span className="text-base font-black text-slate-800">{label}</span>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-[#4ADE80]' : 'bg-[#E2E8F0]'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}
