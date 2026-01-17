import React, { useEffect, useState } from 'react';
import { Readability } from '@mozilla/readability';
import { textVide } from 'text-vide';
import { initImageBlocker } from './features/imageBlocker';
import '@fontsource/opendyslexic';

interface ArticleData {
  title: string;
  content: string;
  textContent: string;
}

const Overlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [timer, setTimer] = useState<number>(25 * 60); // 25 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [imageBlockerEnabled, setImageBlockerEnabled] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerActive && timer > 0) {
        interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
        setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
       const ruler = document.getElementById('reading-ruler');
       if (ruler) {
           ruler.style.top = `${e.clientY - 32}px`; // Center ruler on mouse
       }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Listen for messages to toggle
    const handleMessage = (request: any, _sender: any, _sendResponse: any) => {
      if (request.action === "toggle_a11yson") {
        setIsOpen(prev => !prev);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // For demo/dev purposes initially, maybe just a hotkey or always checking
    // But let's stick to extraction logic when we open
    
    // Attempt to extract content when component mounts (or when opened)
    if (isOpen && !article) {
       extractContent();
    }
  }, [isOpen]);

  const extractContent = () => {
    // Detect Brightspace iframe
    // const iframe = document.querySelector('iframe.d2l-iframe') as HTMLIFrameElement;
    // const doc = iframe && iframe.contentDocument ? iframe.contentDocument : document;
    // Using simple document for now for versatility, can add BS logic later
    const doc = document.cloneNode(true) as Document;
    
    // Readability needs a standalone DOM to mess with
    const reader = new Readability(doc);
    const parsed = reader.parse();

    if (parsed) {
      setArticle({
        title: parsed.title || "Untitled",
        content: parsed.content || "",
        textContent: parsed.textContent || ""
      });
    }
  };

  // Toggle button (floating) for testing if popup isn't ready
  const toggleOverlay = () => {
    setIsOpen(!isOpen);
    if (!article) extractContent();
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (imageBlockerEnabled) {
      cleanup = initImageBlocker();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [imageBlockerEnabled]);

  if (!isOpen) {
    return (
       <div className="fixed bottom-4 right-4 pointer-events-auto">
         <button 
           onClick={toggleOverlay}
           className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-[99999]"
         >
           A11Yson
         </button>
       </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[99999] pointer-events-auto overflow-hidden font-sans">
      {/* Close button */}
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 z-50 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {article ? (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
          
          {/* Top-Left: ADHD (Bionic) */}
          <div className="p-8 overflow-y-auto border-r border-b border-gray-200 bg-white text-gray-900 relative">
            <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-blue-200" onClick={() => setTimerActive(!timerActive)}>
                <span>{timerActive ? '⏸' : '▶'}</span>
                {formatTime(timer)}
            </div>
            <h2 className="text-xl font-bold mb-2 text-blue-600 uppercase tracking-wider">Focus (ADHD)</h2>
            <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
            <div 
              className="prose max-w-none text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: textVide(article.textContent) }} 
            />
          </div>

          {/* Top-Right: Dyslexia */}
          <div className="p-8 overflow-y-auto border-b border-gray-200 bg-[#fffff0] text-black mode-dyslexia font-dyslexic relative group cursor-text" style={{ letterSpacing: '0.1em', lineHeight: '2.0' }}>
             {/* Reading Ruler */}
             <div 
               className="pointer-events-none fixed left-[50%] right-0 h-16 bg-yellow-200/30 border-y-2 border-yellow-400/50 hidden group-hover:block z-50 text-right pr-2 text-yellow-600 text-xs font-bold uppercase tracking-widest mix-blend-multiply"
               id="reading-ruler"
             >
               Dyslexia Guide
             </div>

             <h2 className="text-xl font-bold mb-2 text-yellow-800 uppercase tracking-wider font-sans">Dyslexia Friendly</h2>
             <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
             <div 
               className="prose max-w-none text-xl"
               dangerouslySetInnerHTML={{ __html: article.textContent }} 
             />
          </div>

          {/* Bottom-Left: Sensory (Dark Mode) */}
          <div className="p-8 overflow-y-auto border-r border-gray-200 bg-gray-900 text-gray-100">
             <h2 className="text-xl font-bold mb-2 text-green-400 uppercase tracking-wider">Sensory Safe</h2>
             <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
             <div className="prose prose-invert max-w-none text-lg">
                {/*  Plain text, no images, simple structure */}
                {article.textContent.split('\n').map((para, i) => (
                  para.trim() && <p key={i} className="mb-4">{para}</p>
                ))}
             </div>
          </div>

          {/* Bottom-Right: Original (Cleaned) */}
          <div className="p-8 overflow-y-auto bg-gray-50 text-gray-800">
             <h2 className="text-xl font-bold mb-2 text-gray-500 uppercase tracking-wider">Clean Reader</h2>
             <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
             <div 
               className="prose max-w-none"
               dangerouslySetInnerHTML={{ __html: article.content }} 
             />
          </div>

        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
           <div className="text-xl animate-pulse">Analyzing content...</div>
        </div>
      )}
    </div>
  );
};

export default Overlay;
