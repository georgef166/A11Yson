# A11Yson Project

This project consists of a Next.js frontend and a Python (FastAPI) backend.

## Structure

- `frontend/`: Next.js application (Port 3000)
- `backend/`: FastAPI application (Port 8000)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)

### Running the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (if not already done):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn
   ```
4. Run the backend:
   ```bash
   python main.py
   ```

### Running the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.
