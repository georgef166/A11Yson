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
  const [isDirectCalling, setIsDirectCalling] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
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
              setIsCallActive(response.isCallActive);
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
          Sensory: "sensory",
          Clean: "clean",
        };
        const mappedMode = modeMap[p.primary_condition];
        if (mappedMode && isActive) {
          openReaderMode(mappedMode);
        }
      }
    };

    // Initial Load: Try popupSettings first, then fallback to userProfile
    chrome.storage.local.get(["popupSettings", "userProfile", "isCallActive"], (result) => {
      if (result.popupSettings) {
        const s = result.popupSettings as any;
        setFontSize(s.fontSize || 16);
        setHideImages(s.hideImages || false);
        setFontFamily(s.fontFamily || "Default");
        setGrayscale(s.grayscale || false);
      } else if (result.userProfile) {
        loadProfile(result.userProfile);
      }
      if (result.isCallActive !== undefined) {
        setIsCallActive(!!result.isCallActive);
      }
      setIsLoaded(true);
    });

    // Listen for Sync from Dashboard
    const listener = (changes: any) => {
      if (changes.userProfile) {
        console.log("Real-time Profile Sync:", changes.userProfile.newValue);
        loadProfile(changes.userProfile.newValue);
      }
      if (changes.isCallActive) {
        setIsCallActive(!!changes.isCallActive.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);

    const messageListener = (msg: any) => {
      if (msg.action === "call_status_update") {
        setIsCallActive(msg.isCallActive);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [isActive]);

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
        },
        isCallActive: isCallActive,
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
  }, [fontSize, hideImages, fontFamily, isActive, grayscale, isLoaded, isCallActive]);


  const startDirectCall = async () => {
    setIsDirectCalling(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      console.log("A11Yson: Extracting context for direct call...");
      const response = await chrome.tabs.sendMessage(tab.id, { action: "get_page_text" });
      const text = response?.text || "";

      await chrome.tabs.sendMessage(tab.id, {
        action: "start_call",
        summary: text,
        agentId: "agent_3501kf7qdg2xf3tbkfr7xjmedgdj"
      });
    } catch (err: any) {
      console.error("Direct call failed:", err);
      alert(`Direct call failed: ${err.message}.`);
    } finally {
      setIsDirectCalling(false);
    }
  };

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
      setIsCallActive(false); // Also reset call state
      chrome.tabs.sendMessage(tab.id, { action: "close_a11yson" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-center w-full">
          <img
            src="/logo.svg"
            alt="A11Yson Logo"
            className="h-8"
          />
        </div>
        <div
          className={`w-2 h-2 rounded-full ${isActive || isCallActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-slate-300"}`}
        />
      </header>

      <main className="p-4 space-y-3 text-center">
        {/* LIVE PAGE TOOLS - ALWAYS VISIBLE */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
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
                  className="flex-1 h-2 bg-[#F1F7F2] rounded-lg appearance-none cursor-pointer accent-[#2F7625]"
                />
                <span className="text-lg text-slate-700">A</span>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-2" />

            {/* Toggles */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Reading Font</span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-[#F1F7F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7625] focus:border-transparent transition-all"
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
                className={`w-11 h-6 rounded-full transition-colors relative ${hideImages ? "bg-[#2F7625]" : "bg-slate-200"}`}
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
                className={`w-11 h-6 rounded-full transition-colors relative ${grayscale ? "bg-[#333]" : "bg-slate-200"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${grayscale ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* READER MODES */}
        <div className="space-y-3">
          {isActive && (
            <div className="flex justify-center">
              <span className="text-xs text-[#2F7625] font-bold bg-[#F1F7F2] px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openReaderMode("focus")}
              className={`flex items-center justify-center h-14 rounded-xl border transition-all text-center group shadow-sm hover:shadow-md ${activeMode === "focus" ? "border-[#2F7625] bg-[#F1F7F2]" : "border-slate-200 bg-white"}`}
            >
              <span className="text-sm font-bold text-slate-700">
                ADHD
              </span>
            </button>
            <button
              onClick={() => openReaderMode("dyslexia")}
              className={`flex items-center justify-center h-14 rounded-xl border transition-all text-center group shadow-sm hover:shadow-md ${activeMode === "dyslexia" ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-sm font-bold text-slate-700">
                Dyslexia
              </span>
            </button>
            <button
              onClick={() => openReaderMode("sensory")}
              className={`flex items-center justify-center h-14 rounded-xl border transition-all text-center group shadow-sm hover:shadow-md ${activeMode === "sensory" ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-sm font-bold text-slate-700">
                Sensory
              </span>
            </button>
            <button
              onClick={() => openReaderMode("clean")}
              className={`flex items-center justify-center h-14 rounded-xl border transition-all text-center group shadow-sm hover:shadow-md ${activeMode === "clean" ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-sm font-bold text-slate-700">
                Clean
              </span>
            </button>
          </div>

          {/* Live Call Indicator */}
          {isCallActive && (
            <div className="flex flex-col items-center justify-center p-3 bg-red-50 border border-red-200 rounded-xl animate-pulse mt-1 gap-1">
              <div className="flex items-center gap-3">
                <span className="text-xl"></span>
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1 bg-red-500 h-2 rounded-full animate-[bounce_1s_infinite]"></div>
                  <div className="w-1 bg-red-500 h-4 rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                  <div className="w-1 bg-red-500 h-3 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                  <div className="w-1 bg-red-500 h-2 rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                </div>
              </div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">RECORDING LIVE</span>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-2">
            <button
              onClick={startDirectCall}
              disabled={isDirectCalling}
              className="w-full py-4 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-white transition-all shadow-md active:scale-95 bg-gradient-to-br from-[#2F7625] to-[#206015] hover:brightness-110 disabled:bg-slate-400"
            >
              {isDirectCalling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px]">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="text-xl"></span>
                  <span className="text-xs uppercase tracking-wider">Talk to A11Yson!</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS: RESET */}
        <div className="pt-2">
          {(fontSize !== 16 || hideImages || fontFamily !== "Default" || grayscale || isActive || isCallActive) && (
            <button
              onClick={() => {
                setFontSize(16);
                setHideImages(false);
                setFontFamily("Default");
                setGrayscale(false);
                setIsCallActive(false);
                chrome.storage.local.remove(["userProfile", "popupSettings", "isCallActive"]);
                closeReader();
              }}
              className="w-full py-2 bg-[#F1F7F2] hover:bg-slate-100 text-[#2F7625] font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#2F7625]/20 transition-colors"
            >
              <span>↺</span> Reset All Changes
            </button>
          )}
        </div>
      </main>

    </div>
  );
}

export default App;
