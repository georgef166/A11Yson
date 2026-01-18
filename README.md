#  A11Yson: Redefining Digital Accessibility

**A11Yson** is an AI-powered cognitive accessibility platform designed to make the web neuro-inclusive. It dynamically adapts content for users with ADHD, Dyslexia, and Sensory processing needs, providing a tailored reading experience that minimizes distractions and maximizes focus.

---

## 🚀 Live Links
- **Web Dashboard:** [https://a11yson.vercel.app](https://a11yson.vercel.app) (Frontend)
- **AI Backend:** [https://a11yson-backend.onrender.com](https://a11yson-backend.onrender.com) (FastAPI)

---

## 🛠️ Project Structure
- **/frontend**: Next.js dashboard where users take the accessibility quiz and manage their neuro-profile.
- **/backend**: FastAPI server handling AI summarization, Text-to-Speech (ElevenLabs), and Profile Analysis (Gemini).
- **/extension**: Chrome Extension that injects the A11Yson "Neuro-Flow" reader into any website.

---

## 🧩 Extension Setup (For Judges)
The extension is the core of the A11Yson experience. Follow these steps to load it:

1. **Download & Build:**
   ```bash
   cd extension
   npm install
   npm run build
   ```
2. **Load into Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **"Developer mode"** (top right toggle).
   - Click **"Load unpacked"**.
   - Select the `extension/dist` folder from this project.
3. **Usage:**
   - Go to any content-heavy site (e.g., Wikipedia, Medium).
   - Click the A11Yson logo in your extension toolbar.
   - **Important:** Click "Talk to A11Yson!" to start a live AI interaction or select a **Neuro-Flow Mode** (ADHD, Dyslexia, Sensory, Clean) to transform the page.
   - *Note: Refresh the page after loading the extension for the first time.*

---

## 💻 Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
**Required .env:**
- `GEMINI_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
**Required .env.local:**
- `NEXT_PUBLIC_API_URL=http://localhost:8000` (or your Render URL)
- Firebase Config keys (API_KEY, AUTH_DOMAIN, etc.)

---

## ✨ Features
- **Neuro-Profile Quiz**: Onboarding that identifies your specific accessibility needs.
- **Dynamic Neuro-Flow Modes**:
  - **ADHD Mode**: Bionic reading (bolded prefixes), pomodoro timers, and distraction vignettes.
  - **Dyslexia Mode**: OpenDyslexic font integration, increased letter spacing, and a "Reading Ruler".
  - **Sensory Mode**: Muted color palettes and high-contrast, low-stimulation visuals.
  - **Clean Mode**: Minimalist, distraction-free reading.
- **A11Yson Voice Assistant**: Talk directly to the webpage using Google Gemini and ElevenLabs to ask questions or summarize complex articles.

---

## 🦎 Developed by the A11Yson Team for Hackville 2026
*"We make the web easy!"*
