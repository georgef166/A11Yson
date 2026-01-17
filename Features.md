# A11Yson: Remaining Implementation Plan (Demo Prep)

This document outlines the specific features required to complete the project for the "Demo Impact" goal.

## 1. Safety Net: "God Mode" (Priority: CRITICAL)
*Goal: Ensure the demo never fails due to bad Wi-Fi or complex DOM structures.*
- [ ] **Create `demoData.ts`**: Create a constant containing a perfect, pre-parsed JSON article (e.g., a sample biology lecture or article).
- [ ] **Implement Hotkey Listener**: Add a `keydown` listener (e.g., `Alt + Shift + D`) in `Overlay.tsx`.
- [ ] **Force Load**: When triggered, bypass `Readability` and load the `demoData` immediately into the state.

## 2. The "Neuro-Flow" Grid View (Priority: HIGH)
*Goal: The "Million Dollar Moment" - showing all modes simultaneously to visualize the difference.*
- [ ] **Refactor Components**: Extract current tab contents into reusable components:
    - `<FocusMode data={article} />`
    - `<DyslexiaMode data={article} />`
    - `<SensoryMode data={article} />`
    - `<OriginalMode data={article} />`
- [ ] **Grid Layout**: Create a new 2x2 CSS Grid view in `Overlay.tsx` that renders all four components when `viewMode === 'grid'`.
- [ ] **Toggle Switch**: Add a control to switch between "Tab View" (Single Focus) and "Grid View" (Comparison).

## 3. Specialized Parsing (Priority: MEDIUM)
*Goal: Ensure it works on school portals (Brightspace/D2L) which use IFrames.*
- [ ] **Iframe Penetration**: Update `extractor.ts` (or `Overlay.tsx` extract logic) to check for `iframe.d2l-iframe`.
- [ ] **Content Extraction**: If an iframe is found, run `Readability` on the *iframe's* contentDocument, not the main window.

## 4. Frontend Integration
*Goal: Connect the onboarding quiz results to the extension.*
- [ ] **Verify PostMessage**: Check `frontend/src/app/quiz/page.tsx` (verify file existence first) to ensure it sends the `A11YSON_PROFILE_UPDATE` message upon completion.
- [ ] **Profile Sync**: Ensure the extension's `content.ts` listener correctly saves this to `chrome.storage.local` and triggers a re-render if the overlay is open.

## 5. Polish & UI
- [ ] **Animations**: Ensure smooth transitions between Grid and Tab modes.
- [ ] **TTS Feedback**: Add a visual indicator when TTS is playing in the backend.