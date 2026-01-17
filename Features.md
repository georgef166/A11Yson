## This is structured as a 24-Hour Hackathon Sprint, prioritized by "Demo Impact." If you finish Phase 1 & 2, you have a submission. Phase 3 & 4 are what win you the prize.

# Phase 1: The Skeleton (Hours 0-4)
Goal: Get a React component injecting into a real webpage.

[ ] Initialize Project: Set up Vite + React + TypeScript + CRXJS (or standard Webpack boilerplate).

[ ] Manifest V3 Setup: Create manifest.json with permissions: activeTab, scripting, storage.

[ ] Content Script Injection: Create the logic to inject a <div id="neuroflow-root"> into the <body> of the current tab.

[ ] Tailwind Config: Ensure Tailwind CSS is scoped correctly so it doesn't break the host website's styles (use a prefix like nf- or Shadow DOM).

[ ] Floating Action Button (FAB): Add a small, persistent "Brain" icon in the bottom-right corner of the screen to toggle the app.

Phase 2: The "Explosion" Engine (Hours 4-10)
Goal: The "Million Dollar Moment"—clicking the button splits the screen.

[ ] Readability Integration: Install @mozilla/readability.

Task: Write a function that clones the current document, passes it to Readability, and returns clean HTML text (stripping ads/nav).

[ ] The 4-Panel Grid: Build the main overlay component with a CSS Grid (2x2 layout).

Top-Left: ADHD Mode container.

Top-Right: Dyslexia Mode container.

Bottom-Left: Sensory Mode container.

Bottom-Right: Original Content (control).

[ ] State Management: Create a generic useReadingMode hook that takes the "Clean HTML" and renders it into the 4 containers simultaneously.

Phase 3: The Modes (Hours 10-18)
Goal: Make each panel actually useful.

1. ADHD Mode (Top-Left)

[ ] Bionic Reading: Install text-vide.

Task: Pass the clean text string through textVide() to bold the first half of every word.

[ ] Chunking: Add CSS to double line-height and increase paragraph margins.

[ ] Focus Timer: Add a simple 25-minute countdown timer badge in the corner.

2. Dyslexia Mode (Top-Right)

[ ] Font Override: Import OpenDyslexic font face and apply it to this container.

[ ] Color Tint: Apply the "Irlen Syndrome" fix—Pale Yellow background (#ffffe0) with Dark Blue text (#00008b).

[ ] Ruler Guide: Add a horizontal "Reading Ruler" bar that follows the mouse cursor Y-position (only visible in this quadrant).

3. Sensory/Anxiety Mode (Bottom-Left)

[ ] Dark Mode: Hardcode standard Dark Mode colors (Background #1a1a1a, Text #e5e5e5).

[ ] De-Stimulate: Write a utility function to strip all <img>, <video>, and <svg> tags from the Readability output for this panel.

[ ] Plain Type: Force a system sans-serif font (Inter or Arial) with standard spacing.

Phase 4: The "Sheridan" Polish (Hours 18-24)
Goal: Ensure it works specifically on the sites judges care about.

[ ] The "Brightspace" Fix:

Task: Add a check: if (window.location.host.includes('sheridancollege')).

Logic: If true, look for the d2l-iframe and grab content from inside that iframe, otherwise Readability will return empty text.

[ ] TTS (Text-to-Speech): Add a simple "Play" button to the Dyslexia panel using the browser's native window.speechSynthesis API.

[ ] The Onboarding Quiz: Create a simple 3-step modal on first install:

"Do you have trouble focusing?" -> (Prioritizes ADHD view).

"Do words seem to float?" -> (Prioritizes Dyslexia view).

Output: Save preference to chrome.storage.local.

Phase 5: Demo Prep (The Safety Net)
[ ] "God Mode" Hotkey: Bind a key (e.g., Alt+D) that forces the extension to load a pre-saved, perfect JSON version of a lecture slide.

Why: If the Wi-Fi is slow or Readability fails on the specific page you choose during the demo, this hotkey forces the UI to look perfect instantly.

Tech Stack Recap
Framework: React (Vite)

Styling: Tailwind CSS (wrapped in Shadow DOM if possible)

Core Logic: @mozilla/readability (Parsing), text-vide (Bionic Reading)

Build Tool: CRXJS (makes Vite work with Chrome Extensions)