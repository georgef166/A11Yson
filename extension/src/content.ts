import React from "react";
import ReactDOM from "react-dom/client";
import Overlay from "./Overlay";
import styles from "./index.css?inline";
import { initImageBlocker } from "./features/imageBlocker";

console.log("A11Yson Content Script Loaded");

// --- Live Page Modification Logic ---
let styleElement: HTMLStyleElement | null = null;
let imageBlockerCleanup: (() => void) | null = null;

const updateLiveStyles = (settings: {
  fontSize: number;
  fontFamily: string;
  hideImages: boolean;
  lineHeight: number;
  grayscale: boolean;
}) => {
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "a11yson-live-styles";
    document.head.appendChild(styleElement);
  }

  const { fontSize, fontFamily, hideImages, lineHeight, grayscale } =
    settings;

  let css = "";

  if (fontSize > 14 && fontSize !== 16) {
    // Only apply if changed from default (16px) can be considered "normal"
    css += `
            p, h1, h2, h3, h4, h5, h6, li, a, span, td, th, blockquote, pre {
                font-size: ${fontSize}px !important;
                line-height: 1.5 !important;
            }
        `;
  }

  if (fontFamily && fontFamily !== "Default") {
    css += `
            * {
                font-family: '${fontFamily}', sans-serif !important;
            }
        `;
  }

  if (hideImages) {
    if (!imageBlockerCleanup) {
      imageBlockerCleanup = initImageBlocker();
    }
  } else {
    if (imageBlockerCleanup) {
      imageBlockerCleanup();
      imageBlockerCleanup = null;
    }
  }

  if (lineHeight > 0) {
    css += `
            p, li, div {
                line-height: ${lineHeight} !important;
            }
         `;
  }

  if (grayscale) {
    css += `
            html {
                filter: grayscale(100%) !important;
            }
        `;
  }

  styleElement.textContent = css;
};

// Function to inject the overlay
function injectOverlay() {
  console.log("A11Yson: Attempting to inject overlay...");
  const existingRoot = document.getElementById("a11yson-root");
  if (existingRoot) {
    console.log("A11Yson: Overlay already exists, skipping injection");
    return;
  }

  const rootDiv = document.createElement("div");
  rootDiv.id = "a11yson-root";
  rootDiv.style.position = "fixed";
  rootDiv.style.top = "0";
  rootDiv.style.left = "0";
  rootDiv.style.width = "0";
  rootDiv.style.height = "0";
  rootDiv.style.zIndex = "2147483647";

  document.body.appendChild(rootDiv);

  // Attach Shadow DOM to isolate styles
  const shadow = rootDiv.attachShadow({ mode: "open" });

  // Inject the Tailwind styles into the shadow root
  const styleTag = document.createElement("style");
  styleTag.textContent = styles;
  shadow.appendChild(styleTag);

  // Create a container for React
  const reactContainer = document.createElement("div");
  reactContainer.id = "react-root";
  reactContainer.style.width = "100%";
  reactContainer.style.height = "100%";
  shadow.appendChild(reactContainer);

  const root = ReactDOM.createRoot(reactContainer);
  root.render(React.createElement(Overlay));
  console.log("A11Yson: Overlay injected successfully");
}

injectOverlay();

// Listen for profile updates from the website
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type && event.data.type === "A11YSON_PROFILE_UPDATE") {
    const p = event.data.profile;
    chrome.storage.local.set({ userProfile: p }, () => {
      console.log("A11ySon: Profile Synced & Applying Immediately");
      // Apply Immediately!
      const settings = {
        fontSize: 16,
        fontFamily: p.recommended_font || "Default",
        hideImages: p.features?.image_hiding || false,
        lineHeight: 0,
        grayscale: p.contrast_preference === "grayscale",
      };
      updateLiveStyles(settings);
    });
  } else if (event.data.type && event.data.type === "A11YSON_CALL_STARTED") {
    chrome.storage.local.set({ isCallActive: true });
  }
});

// Listen for Popup Messages (Live Settings)
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  console.log("A11Yson: Received message:", request.action);
  if (request.action === "apply_live_settings") {
    updateLiveStyles(request.settings);
  } else if (request.action === "get_status") {
    const root = document.getElementById("a11yson-root");
    const callWidget = document.querySelector('elevenlabs-convai');
    _sendResponse({
      isOpen: !!root,
      activeTab: "clean", // Fallback or track it
      isCallActive: !!callWidget
    });
    return true;
  } else if (request.action === "get_page_text") {
    // 1. Clone the body to avoid messing with the live page
    const bodyClone = document.body.cloneNode(true) as HTMLElement;

    // 2. Aggressively clear out junk from the clone
    const junkSelectors = [
      'script', 'style', 'noscript', 'iframe', 'canvas', 'svg', 'header', 'footer', 'nav', 'aside',
      '[role="banner"]', '[role="navigation"]', '[role="complementary"]', '[role="contentinfo"]',
      '.header', '#header', '.footer', '#footer', '.nav', '.navigation', '.sidebar', '#sidebar',
      '.menu', '.menu-container', '.ads', '.advertisement', '.social-share', '.comments', '#comments',
      '.related-posts', '.pagination', '.newsletter-signup'
    ];
    junkSelectors.forEach(sel => {
      bodyClone.querySelectorAll(sel).forEach(el => el.remove());
    });

    // 3. Get the clean text
    const text = bodyClone.innerText
      .replace(/\s\s+/g, ' ') // Remove double spaces/newlines
      .trim();

    console.log("A11Yson: [Content] Extracted clean text length:", text.length);
    _sendResponse({ text });
    return true;
  } else if (request.action === "start_call") {
    const { summary, agentId } = request;
    console.log("A11Yson: [Content] Starting AI Call with full context...");

    const existing = document.getElementById("a11yson-voice-frame");
    if (existing) existing.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "a11yson-voice-frame";
    iframe.setAttribute("allow", "microphone");

    // Just pass the agentId in URL, data comes via postMessage
    iframe.src = `http://localhost:8000/voice-widget?agentId=${agentId}`;

    Object.assign(iframe.style, {
      position: "fixed",
      bottom: "10px",
      right: "10px",
      width: "400px",
      height: "600px",
      border: "none",
      zIndex: "2147483647",
      background: "transparent",
      colorScheme: "light",
      pointerEvents: "auto"
    });

    iframe.onload = () => {
      console.log("A11Yson: [Content] Iframe loaded, transmitting high-quality context...");
      setTimeout(() => {
        iframe.contentWindow?.postMessage({
          type: 'SET_CONTEXT',
          context: summary
        }, '*');
      }, 100);
    };

    document.body.appendChild(iframe);
    chrome.storage.local.set({ isCallActive: true });
    _sendResponse({ success: true });
    return true;
  } else if (request.action === "open_mode") {
    applyReaderMode(request.mode);
  } else if (request.action === "close_a11yson") {
    // 1. Remove Reader Styles
    const readerStyle = document.getElementById("a11yson-reader-mode-styles");
    if (readerStyle) readerStyle.remove();

    // 2. Remove AI Voice Frame
    const voiceFrame = document.getElementById("a11yson-voice-frame");
    if (voiceFrame) voiceFrame.remove();

    // 3. Remove Vignette if exists
    const vignette = document.getElementById("a11yson-vignette");
    if (vignette) vignette.remove();

    console.log("A11ySon: Environment Reset Successfully.");
  }
});

const applyReaderMode = (mode: string) => {
  let readerStyle = document.getElementById("a11yson-reader-mode-styles") as HTMLStyleElement;
  if (!readerStyle) {
    readerStyle = document.createElement("style");
    readerStyle.id = "a11yson-reader-mode-styles";
    document.head.appendChild(readerStyle);
  }

  // Cleanup existing mode-specific elements
  document.getElementById("a11yson-vignette")?.remove();

  let css = "";

  if (mode === "focus") {
    // ADHD PRESET - High focus on center content
    const vignette = document.createElement("div");
    vignette.id = "a11yson-vignette";
    Object.assign(vignette.style, {
      position: "fixed",
      top: "0", left: "0", width: "100%", height: "100%",
      pointerEvents: "none",
      zIndex: "2147483645",
      background: "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 100%)",
      transition: "opacity 0.8s ease"
    });
    document.body.appendChild(vignette);

    css = `
      body {
        background-color: #f1f5f9 !important;
        transition: background-color 0.5s ease !important;
      }
      main, article, .content, #main-content {
        background: white !important;
        padding: 40px !important;
        border-radius: 24px !important;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important;
        max-width: 68ch !important;
        margin: 40px auto !important;
        position: relative !important;
        z-index: 2147483646 !important;
      }
      p, li {
        font-family: 'Inter', 'Helvetica', sans-serif !important;
        line-height: 1.8 !important;
        font-size: 1.15rem !important;
        color: #1e293b !important;
        margin-bottom: 1.5em !important;
      }
      header, footer, nav, aside, .ads, .sidebar {
        opacity: 0.1 !important;
        filter: blur(4px) !important;
        pointer-events: none !important;
      }
      * { animation: none !important; }
    `;
  } else if (mode === "dyslexia") {
    // DYSLEXIA PRESET - Improved spacing and reduced glare
    css = `
      body {
        background-color: #fdf6e3 !important; /* Solarized base3 - extremely easy on eyes */
        background-image: linear-gradient(rgba(0,0,0,0.01) 1px, transparent 1px) !important;
        background-size: 100% 1.8em !important; /* Subtle reading lines */
      }
      * {
        font-family: 'Helvetica', 'Arial', sans-serif !important;
        color: #586e75 !important;
        text-align: left !important;
        letter-spacing: 0.05em !important;
        word-spacing: 0.15em !important;
      }
      p, li, div {
        line-height: 1.9 !important;
        font-size: 1.2rem !important;
        max-width: 75ch !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
      h1, h2, h3 {
        color: #268bd2 !important;
        margin-top: 1.5em !important;
        margin-bottom: 0.5em !important;
        font-weight: 800 !important;
      }
    `;
  } else if (mode === "sensory") {
    // SENSORY PRESET - Muted and predictable
    css = `
      * {
        background-color: #e2e8f0 !important;
        color: #64748b !important;
        border-color: #cbd5e1 !important;
        box-shadow: none !important;
        text-shadow: none !important;
        transition: none !important;
        animation: none !important;
      }
      body {
        background-color: #e2e8f0 !important;
      }
      img, video, iframe, canvas {
        display: none !important;
      }
      header, nav, aside, footer {
        display: none !important;
      }
      p, li {
        font-size: 1.1rem !important;
        line-height: 1.6 !important;
        max-width: 700px !important;
        margin: 20px auto !important;
      }
    `;
  } else if (mode === "clean") {
    // CLEAN PRESET - Foundations of AA
    css = `
      * {
        font-family: 'Inter', system-ui, sans-serif !important;
        color: #000000 !important;
      }
      body {
        background-color: #ffffff !important;
        padding: 4% !important;
      }
      main, article {
        max-width: 900px !important;
        margin: 0 auto !important;
      }
      p, .article-content div, main div {
        line-height: 1.8 !important;
        font-size: 1.2rem !important;
        margin-bottom: 2.5rem !important;
        display: block !important;
      }
      li {
        margin-bottom: 1rem !important;
      }
      a {
        color: #2563eb !important;
        text-decoration: underline !important;
        font-weight: 600 !important;
      }
      nav, footer, aside, .ads {
        display: none !important;
      }
    `;
  }

  readerStyle.textContent = css;
};

// INITIALIZATION: Check for saved profile and apply
chrome.storage.local.get(["userProfile", "popupSettings"], (result) => {
  if (result.popupSettings) {
    const s = result.popupSettings as any;
    const settings = {
      fontSize: s.fontSize || 16,
      fontFamily: s.fontFamily || "Default",
      hideImages: s.hideImages || false,
      lineHeight: s.lineHeight || 0,
      grayscale: s.grayscale || false,
    };
    console.log("A11ySon: Auto-applying stashed popup settings:", settings);
    updateLiveStyles(settings);
  } else if (result.userProfile) {
    const p = result.userProfile as any;
    const settings = {
      fontSize: 16,
      fontFamily: p.recommended_font || "Default",
      hideImages: p.features?.image_hiding || false,
      lineHeight: 0,
      grayscale: p.contrast_preference === "grayscale",
    };
    console.log("A11ySon: Auto-applying saved profile:", settings);
    updateLiveStyles(settings);
  }
});
