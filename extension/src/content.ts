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
    css += `
            @font-face {
                font-family: 'OpenDyslexic';
                src: url('${chrome.runtime.getURL('assets/OpenDyslexic-Regular.otf')}') format('opentype');
            }
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
  const existingRoot = document.getElementById('a11yson-root');
  if (existingRoot) return;

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
}

injectOverlay();

// Listen for profile updates from the website
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type && event.data.type === "A11YSON_PROFILE_UPDATE") {
    chrome.storage.local.set({ userProfile: event.data.profile }, () => {
      // alert("A11Yson Profile Synced!");
    });
  }
});

// Listen for Popup Messages (Live Settings)
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "apply_live_settings") {
    updateLiveStyles(request.settings);
  }
});
