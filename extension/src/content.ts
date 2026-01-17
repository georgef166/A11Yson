// src/content.ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import Overlay from './Overlay';
import './index.css'; // Inject Tailwind styles

console.log("A11Yson Content Script Loaded");

// Function to inject the overlay
function injectOverlay() {
  const existingRoot = document.getElementById('a11yson-root');
  if (existingRoot) return; // Already injected

  const rootDiv = document.createElement('div');
  rootDiv.id = 'a11yson-root';
  rootDiv.style.position = 'fixed';
  rootDiv.style.top = '0';
  rootDiv.style.left = '0';
  rootDiv.style.width = '100vw'; // Full viewport width
  rootDiv.style.height = '100vh'; // Full viewport height
  rootDiv.style.zIndex = '2147483647'; // Max z-index
  rootDiv.style.pointerEvents = 'none'; // Click-through initially, overlay will handle its own pointer events

  document.body.appendChild(rootDiv);

  const root = ReactDOM.createRoot(rootDiv);
  root.render(React.createElement(Overlay));
}

// Inject immediately (for testing) or via message from popup
injectOverlay();

// Listen for profile updates from the website
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type && event.data.type === "A11YSON_PROFILE_UPDATE") {
    console.log("Received profile update:", event.data.profile);
    chrome.storage.local.set({ userProfile: event.data.profile }, () => {
      console.log("Profile saved to extension storage");
      alert("A11Yson Profile Synced!");
    });
  }
});
