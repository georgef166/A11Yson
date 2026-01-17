from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from models import QuizResponse, QuizResult, UserProfile, TTSRequest
from gemini_service import GeminiService
from elevenlabs_service import ElevenLabsService

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
gemini_service = GeminiService()
elevenlabs_service = ElevenLabsService()

# Mount static directory for mock audio (optional)
# app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return {"message": "A11yson Backend is Running"}

@app.post("/api/quiz/generate")
async def generate_quiz():
    """Generates the initial cognitive quiz questions."""
    questions = await gemini_service.generate_quiz()
    return {"questions": questions}

@app.post("/api/quiz/analyze")
async def analyze_quiz(responses: list[dict]):
    """Analyzes the quiz responses and suggests a profile."""
    # Convert list of dicts to schema if needed, or just pass to service
    result = await gemini_service.analyze_results(responses)
    return result

@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """Converts text to speech using ElevenLabs."""
    audio_url = await elevenlabs_service.generate_speech(request.text, request.voice_id)
    return {"audio_url": audio_url}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
