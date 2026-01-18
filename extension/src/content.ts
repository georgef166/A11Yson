import React from 'react';
import ReactDOM from 'react-dom/client';
import Overlay from './Overlay';
import styles from './index.css?inline';

console.log("A11Yson Content Script Loaded");

// --- Live Page Modification Logic ---
let styleElement: HTMLStyleElement | null = null;


const updateLiveStyles = (settings: { fontSize: number; dyslexiaFont: boolean; hideImages: boolean; lineHeight: number }) => {
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'a11yson-live-styles';
    document.head.appendChild(styleElement);
  }

  const { fontSize, dyslexiaFont, hideImages, lineHeight } = settings;

  let css = '';

  if (fontSize > 14 && fontSize !== 16) { // Only apply if changed from default (16px) can be considered "normal"
    css += `
            p, h1, h2, h3, h4, h5, h6, li, a, span, td, th, blockquote, pre {
                font-size: ${fontSize}px !important;
                line-height: 1.5 !important;
            }
        `;
  }

  if (dyslexiaFont) {
    // Font is loaded via @fontsource/opendyslexic npm package, no need for @font-face
    css += `
            * {
                font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
            }
        `;
  }

  if (hideImages) {
    css += `
            img, video, picture, svg, canvas, embed, object {
                opacity: 0 !important;
                visibility: hidden !important;
            }
            [style*="background-image"] {
                background-image: none !important;
            }
        `;
  }

  if (lineHeight > 0) {
    css += `
            p, li, div {
                line-height: ${lineHeight} !important;
            }
         `;
  }

  styleElement.textContent = css;
};

// Function to inject the overlay
function injectOverlay() {
  console.log('A11Yson: Attempting to inject overlay...');
  const existingRoot = document.getElementById('a11yson-root');
  if (existingRoot) {
    console.log('A11Yson: Overlay already exists, skipping injection');
    return;
  }

  const rootDiv = document.createElement('div');
  rootDiv.id = 'a11yson-root';
  rootDiv.style.position = 'fixed';
  rootDiv.style.top = '0';
  rootDiv.style.left = '0';
  rootDiv.style.width = '0';
  rootDiv.style.height = '0';
  rootDiv.style.zIndex = '2147483647';

  document.body.appendChild(rootDiv);

  // Attach Shadow DOM to isolate styles
  const shadow = rootDiv.attachShadow({ mode: 'open' });

  // Inject the Tailwind styles into the shadow root
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  shadow.appendChild(styleTag);

  // Create a container for React
  const reactContainer = document.createElement('div');
  reactContainer.id = 'react-root';
  reactContainer.style.width = '100%';
  reactContainer.style.height = '100%';
  shadow.appendChild(reactContainer);

  const root = ReactDOM.createRoot(reactContainer);
  root.render(React.createElement(Overlay));
  console.log('A11Yson: Overlay injected successfully');
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
        dyslexiaFont: p.recommended_font === "OpenDyslexic",
        hideImages: p.features?.image_hiding || false,
        lineHeight: 0
      };
      updateLiveStyles(settings);
    });
  }
});

// Listen for Popup Messages (Live Settings)
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  console.log('A11Yson: Received message:', request.action);
  if (request.action === "apply_live_settings") {
    updateLiveStyles(request.settings);
  }
});

// INITIALIZATION: Check for saved profile and apply
chrome.storage.local.get("userProfile", (result) => {
  if (result.userProfile) {
    const p = result.userProfile as any;
    const settings = {
      fontSize: 16, // Default, hard to infer from "comfortable" vs "compact" without heuristics
      dyslexiaFont: p.recommended_font === "OpenDyslexic",
      hideImages: p.features?.image_hiding || false,
      lineHeight: 0
    };
    console.log("A11ySon: Auto-applying saved profile:", settings);
    updateLiveStyles(settings);
  }
});
