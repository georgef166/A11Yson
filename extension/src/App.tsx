import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isActive, setIsActive] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  // Settings State (Live Page)
  const [fontSize, setFontSize] = useState(16);
  const [hideImages, setHideImages] = useState(false);
  const [fontFamily, setFontFamily] = useState("Default");
  const [grayscale, setGrayscale] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check current status
    const checkStatus = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "get_status" },
          (response) => {
            if (!chrome.runtime.lastError && response) {
              setIsActive(response.isOpen);
              setActiveMode(response.activeTab);
            }
          },
        );
      }
    };
    checkStatus();
  }, []);

  // Load Saved Profile & Sync across sessions
  useEffect(() => {
    const loadProfile = (data?: any) => {
      const p = data || {};
      if (p.recommended_font) setFontFamily(p.recommended_font);
      else setFontFamily("Default");

      if (p.features?.image_hiding) setHideImages(true);
      else setHideImages(false);

      if (p.content_density === "chunked") setFontSize(18);
      else if (p.content_density === "compact") setFontSize(14);
      else setFontSize(16);

      if (p.contrast_preference === "grayscale") setGrayscale(true);
      else setGrayscale(false);

      // If storage updated and we have a primary condition, we could auto-switch mode if active
      if (p.primary_condition) {
        const modeMap: any = {
          ADHD: "focus",
          Dyslexia: "dyslexia",
          Anxiety: "sensory",
          Clean: "clean",
        };
        const mappedMode = modeMap[p.primary_condition];
        if (mappedMode && isActive) {
          openReaderMode(mappedMode);
        }
      }
    };

    // Initial Load: Try popupSettings first, then fallback to userProfile
    chrome.storage.local.get(["popupSettings", "userProfile"], (result) => {
      if (result.popupSettings) {
        const s = result.popupSettings as any;
        setFontSize(s.fontSize || 16);
        setHideImages(s.hideImages || false);
        setFontFamily(s.fontFamily || "Default");
        setGrayscale(s.grayscale || false);
      } else if (result.userProfile) {
        loadProfile(result.userProfile);
      }
      setIsLoaded(true);
    });

    // Listen for Sync from Dashboard
    const listener = (changes: any) => {
      if (changes.userProfile) {
        console.log("Real-time Profile Sync:", changes.userProfile.newValue);
        loadProfile(changes.userProfile.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Send LIVE settings updates & Persist locally
  useEffect(() => {
    if (!isLoaded) return;

    const updateLiveSettings = async () => {
      // Save for popup persistence
      chrome.storage.local.set({
        popupSettings: { fontSize, hideImages, fontFamily, grayscale },
        userProfile: {
          recommended_font: fontFamily,
          contrast_preference: grayscale ? "grayscale" : "default",
          content_density:
            fontSize === 18
              ? "chunked"
              : fontSize === 14
                ? "compact"
                : "comfortable",
          features: {
            bionic_reading: false,
            image_hiding: hideImages,
            tts_enabled: false,
            reduce_motion: false,
          },
        }
      });

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        // Live page CSS injection
        chrome.tabs.sendMessage(tab.id, {
          action: "apply_live_settings",
          settings: {
            fontSize,
            hideImages,
            fontFamily,
            lineHeight: 0,
            grayscale,
          },
        });

        // If the Reader Overlay is open, also sync settings there
        if (isActive) {
          chrome.tabs.sendMessage(tab.id, {
            action: "update_settings",
            settings: { fontSize, hideImages },
          });
        }
      }
    };
    const timeout = window.setTimeout(updateLiveSettings, 50);
    return () => window.clearTimeout(timeout);
  }, [fontSize, hideImages, fontFamily, isActive, grayscale, isLoaded]);

  const openReaderMode = async (mode: string) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      setIsActive(true);
      setActiveMode(mode);
      chrome.tabs.sendMessage(tab.id, { action: "open_mode", mode });
    }
  };

  const closeReader = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      setIsActive(false);
      setActiveMode(null);
      chrome.tabs.sendMessage(tab.id, { action: "close_a11yson" });
    }
  };

  return (
    <div className="w-[340px] bg-slate-50 text-slate-900 font-sans">
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight">
          A11Yson{" "}
          <span className="text-xs text-slate-400 font-normal ml-1">
            Assistant
          </span>
        </h1>
        <div
          className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-slate-300"}`}
        />
      </header>

      <main className="p-4 space-y-6">
        {/* LIVE PAGE TOOLS - ALWAYS VISIBLE */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
            Live Page Tools
          </h2>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            {/* Font Size */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">
                  Page Font Size
                </span>
                <span className="text-slate-400 text-xs">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">A</span>
                <input
                  type="range"
                  min="14"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-lg text-slate-700">A</span>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-2" />

            {/* Toggles */}
            {/* Font Selection Dropdown */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Reading Font</span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Default">Default Site Font</option>
                <option value="Calibri">Calibri</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Hide Images
              </span>
              <button
                onClick={() => setHideImages(!hideImages)}
                className={`w-11 h-6 rounded-full transition-colors relative ${hideImages ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hideImages ? "left-6" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Grayscale Mode
              </span>
              <button
                onClick={() => setGrayscale(!grayscale)}
                className={`w-11 h-6 rounded-full transition-colors relative ${grayscale ? "bg-slate-600" : "bg-slate-200"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${grayscale ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* READER MODES */}
        <div className="space-y-4">
          <div className="flex justify-between items-center pl-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Neuro-Flow Active Reader
            </h2>
            {isActive && (
              <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openReaderMode("focus")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-2 group shadow-sm hover:shadow-md ${activeMode === "focus" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🧘
              </span>
              <span className="text-sm font-bold text-slate-700 mt-1">
                ADHD
              </span>
            </button>
            <button
              onClick={() => openReaderMode("dyslexia")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-2 group shadow-sm hover:shadow-md ${activeMode === "dyslexia" ? "border-yellow-500 bg-yellow-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                📖
              </span>
              <span className="text-sm font-bold text-slate-700 mt-1">
                Dyslexia
              </span>
            </button>
            <button
              onClick={() => openReaderMode("sensory")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-2 group shadow-sm hover:shadow-md ${activeMode === "sensory" ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🌙
              </span>
              <span className="text-sm font-bold text-slate-700 mt-1">
                Sensory
              </span>
            </button>
            <button
              onClick={() => openReaderMode("clean")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-2 group shadow-sm hover:shadow-md ${activeMode === "clean" ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                ✨
              </span>
              <span className="text-sm font-bold text-slate-700 mt-1">
                Clean
              </span>
            </button>
          </div>

          {(fontSize !== 16 || hideImages || fontFamily !== "Default" || isActive) && (
            <button
              onClick={() => {
                setFontSize(16);
                setHideImages(false);
                setFontFamily("Default");
                setGrayscale(false);
                chrome.storage.local.remove(["userProfile", "popupSettings"]);
                closeReader(); // Reset should ALWAYS close the reader
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 transition-colors mt-3"
            >
              <span>↺</span> Reset All Changes
            </button>
          )}

          {isActive && (
            <button
              onClick={closeReader}
              className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
            >
              Close Reader Mode
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
