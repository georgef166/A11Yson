# A11yson

**A11yson** is a cognitive accessibility assistant that personalizes the web experience for users with ADHD, Dyslexia, Autism, and more.

## Components

### 1. Backend API (`/backend`)
- **Tech**: Python, FastAPI
- **Runs on**: `http://localhost:8000`
- **Setup**:
  ```bash
  cd backend
  pip install -r requirements.txt
  python main.py
  ```

### 2. Frontend Platform (`/frontend`)
- **Tech**: Next.js, React, TailwindCSS
- **Runs on**: `http://localhost:3000`
- **Setup**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

### 3. Chrome Extension (`/extension`)
- **Tech**: Manifest V3, JavaScript
- **Setup**:
  1. Open Chrome and go to `chrome://extensions`.
  2. Enable **Developer mode**.
  3. Click **Load unpacked**.
  4. Select the `/extension` folder in this project.

## Features
- **Cognitive Quiz**: AI-powered assessment to determine user needs.
- **Text-to-Speech**: ElevenLabs integration for reading content.
- **Image Blocking**: Helps reduce sensory overload by hiding images until clicked.
- **Theme Injection**: automatically adjusts site themes (prototype).
