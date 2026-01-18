import React, { useEffect, useState } from 'react';
import { Readability } from '@mozilla/readability';
import { DEMO_ARTICLE } from './demoData';
import type { ArticleData, OverlaySettings } from './types';
import { initImageBlocker } from './features/imageBlocker';

// Components
import FocusMode from './components/FocusMode';
import DyslexiaMode from './components/DyslexiaMode';
import SensoryMode from './components/SensoryMode';
import CleanMode from './components/CleanMode';

const Overlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'focus' | 'dyslexia' | 'sensory' | 'clean'>('clean');
  const [viewMode, setViewMode] = useState<'tab' | 'grid'>('tab');
  const [article, setArticle] = useState<ArticleData | null>(null);

  const [settings, setSettings] = useState<OverlaySettings>({
    fontSize: 18,
    hideImages: false
  });

  // Message Listener
  useEffect(() => {
    const handleMessage = (request: any, _sender: any, _sendResponse: any) => {
      console.log('A11Yson Overlay: Received message:', request.action);
      if (request.action === "toggle_a11yson") {
        setIsOpen(prev => !prev);
      } else if (request.action === "open_mode") {
        console.log('A11Yson Overlay: Opening mode:', request.mode);
        setIsOpen(true);
        setActiveTab(request.mode);
        _sendResponse({});
      } else if (request.action === "update_settings") { // NEW: Handle settings update
        setSettings(prev => ({ ...prev, ...request.settings }));
        // If generic open call included
        if (request.open) setIsOpen(true);
        _sendResponse({});
      } else if (request.action === "close_a11yson") {
        setIsOpen(false);
        _sendResponse({});
      } else if (request.action === "get_status") {
        _sendResponse({ isOpen, activeTab });
        return true;
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [isOpen]); // Removed activeTab to stabilize

  // Extract content when overlay opens
  useEffect(() => {
    if (isOpen && !article) {
      console.log('A11Yson Overlay: Extracting content...');
      extractContent();
    }
  }, [isOpen, article]);

  // Handle Profile Sync
  const applyProfile = (p: any) => {
    // Set Default Mode based on Condition
    if (p.primary_condition === "ADHD") setActiveTab('focus');
    else if (p.primary_condition === "Dyslexia") setActiveTab('dyslexia');
    else if (p.primary_condition === "Anxiety") setActiveTab('sensory');
    else if (p.primary_condition === "Clean") setActiveTab('clean');

    // Set Settings
    setSettings(prev => ({
      ...prev,
      hideImages: p.features?.image_hiding || false,
      fontSize: p.content_density === "chunked" ? 20 : 18
    }));
  };

  // Load Saved Profile & Listen for updates
  useEffect(() => {
    chrome.storage.local.get("userProfile", (result) => {
      if (result.userProfile) applyProfile(result.userProfile);
    });

    const storageListener = (changes: any) => {
      if (changes.userProfile) {
        console.log("A11ySon Overlay: Profile Sync Update", changes.userProfile.newValue);
        if (changes.userProfile.newValue) {
          applyProfile(changes.userProfile.newValue);
        }
      }
    };
    chrome.storage.onChanged.addListener(storageListener);
    return () => chrome.storage.onChanged.removeListener(storageListener);
  }, []);



  // ... (inside component)

  // Global Image Blocker Effect
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (settings.hideImages) {
      cleanup = initImageBlocker();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [settings.hideImages]);

  // God Mode: Alt + Shift + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        console.log("GOD MODE ACTIVATED");
        setArticle(DEMO_ARTICLE);
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Extraction Logic
  const extractContent = () => {
    try {
      let doc = document.cloneNode(true) as Document;

      // Iframe Penetration (Brightspace / D2L)
      // This is crucial for student portals where content is often nested
      const iframe = document.querySelector('iframe.d2l-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        console.log("A11ySon: Brightspace Iframe detected, attempting nested extraction...");
        try {
          // We must clone the iframe's document, not the window's
          doc = iframe.contentDocument.cloneNode(true) as Document;
        } catch (e) {
          console.warn("A11ySon: Cross-origin iframe restricted. Falling back to main page.");
        }
      }

      const reader = new Readability(doc);
      const parsed = reader.parse();
      if (parsed) {
        setArticle({
          title: parsed.title || "Untitled",
          content: parsed.content || "",
          textContent: parsed.textContent || ""
        });
      }
    } catch (e) {
      console.error("Readability failed", e);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-[2147483647] pointer-events-auto flex flex-col font-sans text-slate-900">

      {/* Header */}
      <header className="absolute top-4 right-6 z-50 flex gap-2">
        {/* Grid Toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'tab' ? 'grid' : 'tab')}
          className={`group p-2 rounded-full font-bold text-sm border shadow-sm transition-all flex items-center gap-2 px-4 ${viewMode === 'grid'
            ? 'bg-purple-600 text-white border-purple-600'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50'
            }`}
          title="Toggle Neuro-Flow Grid"
        >
          {viewMode === 'tab' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>View Grid</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Tab View</span>
            </>
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="group bg-white/80 backdrop-blur p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all"
          title="Close Overlay"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-white">
        {article ? (
          viewMode === 'tab' ? (
            // TAB VIEW
            <div className="h-full w-full max-w-4xl mx-auto pt-16">
              {/* Tab Headers (Optional: Could add simple tab switcher if not relying on keybinds/msg) */}
              {activeTab === 'focus' && <FocusMode article={article} settings={settings} />}
              {activeTab === 'dyslexia' && <DyslexiaMode article={article} settings={settings} />}
              {activeTab === 'sensory' && <SensoryMode article={article} settings={settings} />}
              {activeTab === 'clean' && <CleanMode article={article} settings={settings} />}
            </div>
          ) : (
            // GRID VIEW (The "Explosion")
            <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
              <div className="border-r border-b border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 scale-[0.8] origin-top-left w-[125%] h-[125%]">
                  <FocusMode article={article} settings={settings} />
                </div>
                <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">ADHD</div>
              </div>
              <div className="border-b border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 scale-[0.8] origin-top-left w-[125%] h-[125%]">
                  <DyslexiaMode article={article} settings={settings} />
                </div>
                <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Dyslexia</div>
              </div>
              <div className="border-r border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 scale-[0.8] origin-top-left w-[125%] h-[125%]">
                  <SensoryMode article={article} settings={settings} />
                </div>
                <div className="absolute top-2 left-2 bg-green-900 text-green-100 text-xs font-bold px-2 py-1 rounded">Sensory</div>
              </div>
              <div className="relative overflow-hidden bg-white">
                <div className="absolute inset-0 scale-[0.8] origin-top-left w-[125%] h-[125%]">
                  <CleanMode article={article} settings={settings} />
                </div>
                <div className="absolute top-2 left-2 bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">Clean</div>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium animate-pulse">Analyzing page content...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Overlay;
