from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.ai_service import analyze_profile, generate_speech
from fastapi.responses import Response

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    # Allow all origins for the hackathon ensuring extension works without ID checking
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Hello from the Python backend!"}

@app.get("/api/data")
async def get_data():
    return {"data": "This is some data from the backend", "status": "success"}

@app.post("/api/analyze-profile")
async def analyze_profile_endpoint(quiz_data: dict):
    """Endpoint for the frontend quiz to send data to Gemini"""
    result = await analyze_profile(quiz_data)
    return result

@app.post("/api/tts")
async def tts_endpoint(text_data: dict):
    """Endpoint for TTS (Frontend or Extension)"""
    try:
        text = text_data.get("text")
        if not text:
            raise HTTPException(status_code=400, detail="Text required")
        
        audio_content = await generate_speech(text)
        return Response(content=audio_content, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
