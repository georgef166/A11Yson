"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  id: number;
  text: string;
  type: "scale" | "yesno" | "text";
  key: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "When reading a long article, do you find lines of text tend to blur or swim together?",
    type: "yesno",
    key: "visual_confusion",
  },
  {
    id: 2,
    text: "Do you often find yourself re-reading the same sentence multiple times because you lost focus?",
    type: "scale", // 1-5
    key: "attention_focus",
  },
  {
    id: 3,
    text: "Do bright white backgrounds on websites cause you eye strain or headaches?",
    type: "yesno",
    key: "light_sensitivity",
  },
  {
    id: 4,
    text: "How do you feel when a webpage has many moving elements (GIFs, auto-play videos)?",
    type: "text", // Prompt for descriptive feeling
    key: "sensory_overload",
  },
];

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

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Editable State for the Dashboard
  const [profileState, setProfileState] = useState<any>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Initialize editable state when result arrives
  useEffect(() => {
    if (result) {
      setProfileState(result);
    }
  }, [result]);

  const applyPreset = (presetName: string) => {
    if (!profileState) return;
    const preset = PRESETS[presetName];
    setProfileState({
      ...profileState,
      primary_condition: presetName, // Update the badge too
      recommended_font: preset.recommended_font,
      contrast_preference: preset.contrast_preference,
      content_density: preset.content_density,
      features: { ...preset.features }
    });
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
  };

  const handleAnswer = (answer: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: answer }));
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitQuiz({ ...answers, [currentQuestion.key]: answer });
    }
  };

  const submitQuiz = async (finalAnswers: any) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:8000/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playQuestionAudio = async (text: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (e) {
      console.error("TTS failed", e);
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  if (profileState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-zinc-50 dark:bg-black text-black dark:text-white font-sans transition-colors duration-500">

        <div className="w-full max-w-5xl animate-fade-in-up bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row h-auto md:h-[600px]">

          {/* LEFT SIDEBAR - PRESETS */}
          <div className="w-full md:w-1/3 bg-zinc-100 dark:bg-zinc-950 p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-1">Welcome, George</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Select a Preset</p>
            </div>

            <div className="space-y-3 flex-1">
              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center justify-between group ${profileState.primary_condition === name
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                >
                  <span className="font-bold text-lg">{name}</span>
                  {profileState.primary_condition === name && (
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
            <div className="flex gap-4 mt-8">
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
                className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
              >
                Sync Changes to Extension
              </button>
              <Link href="/" className="px-6 py-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-center">
                Done
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-black text-black dark:text-white transition-colors duration-500">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="w-full bg-zinc-200 h-2 rounded-full mb-8 dark:bg-zinc-800">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          />
        </div>

        {isAnalyzing ? (
          <div className="text-center animate-pulse">
            <h2 className="text-2xl font-bold mb-2">Analyzing your needs...</h2>
            <p className="text-zinc-500">Connecting to Gemini AI...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-6">
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Question {currentQuestion.id} of {questions.length}</span>
              <button
                onClick={() => playQuestionAudio(currentQuestion.text)}
                className="text-zinc-400 hover:text-blue-500 transition-colors"
                title="Listen to question"
              >
                🔊
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-8 leading-snug">{currentQuestion.text}</h2>

            <div className="space-y-4">
              {currentQuestion.type === "yesno" && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswer("yes")}
                    className="p-4 rounded-xl border-2 border-zinc-200 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-blue-900/20 transition-all font-medium"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleAnswer("no")}
                    className="p-4 rounded-xl border-2 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-all font-medium"
                  >
                    No
                  </button>
                </div>
              )}

              {currentQuestion.type === "scale" && (
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => handleAnswer(num)}
                      className="aspect-square rounded-lg border-2 border-zinc-200 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 font-bold text-lg transition-all"
                    >
                      {num}
                    </button>
                  ))}
                  <div className="col-span-5 flex justify-between text-sm text-zinc-500 mt-2">
                    <span>Never</span>
                    <span>Always</span>
                  </div>
                </div>
              )}

              {currentQuestion.type === "text" && (
                <div>
                  <textarea
                    className="w-full p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent focus:border-blue-500 outline-none min-h-[120px]"
                    placeholder="Type your answer here..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAnswer(e.currentTarget.value);
                      }
                    }}
                  />
                  <p className="text-xs text-zinc-500 mt-2 text-right">Press Enter to continue</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
