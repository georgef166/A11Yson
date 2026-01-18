from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.ai_service import analyze_profile, generate_speech, summarize_text
from fastapi.responses import Response, HTMLResponse
import json

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

@app.post("/api/summarize")
async def summarize_endpoint(data: dict):
    """Endpoint to summarize page content using Gemini"""
    try:
      text = data.get("text")
      if not text:
          raise HTTPException(status_code=400, detail="Text required")
      
      summary = await summarize_text(text)
      return {"summary": summary}
    except Exception as e:
      raise HTTPException(status_code=500, detail=str(e))

@app.get("/voice-widget", response_class=HTMLResponse)
async def voice_widget(agentId: str = ""):
    """Returns a clean HTML page with the ElevenLabs widget to bypass extension CSP blocks"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body, html {{ 
                margin: 0; padding: 0; width: 100%; height: 100%; 
                overflow: hidden; background: transparent; 
                display: flex; align-items: flex-end; justify-content: flex-end;
            }}
            elevenlabs-convai {{ 
                opacity: 1; transform: scale(1.1); transform-origin: bottom right; 
                transition: opacity 0.5s ease; 
            }}
        </style>
    </head>
    <body>
        <elevenlabs-convai agent-id="{agentId}"></elevenlabs-convai>

        <script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>

        <script>
            let contextReady = false;
            const widget = document.querySelector('elevenlabs-convai');

            window.addEventListener('message', (event) => {{
                if (event.data && event.data.type === 'SET_CONTEXT') {{
                    console.log("A11yson Widget: Context received. Injecting into Agent...");
                    
                    const contextText = event.data.context;
                    if (contextText) {{
                        widget.setAttribute('dynamic-variables', JSON.stringify({{ summary: contextText }}));
                        contextReady = true;
                        
                        // Small delay to ensure widget registers variables before start
                        setTimeout(startCallProcess, 300);
                    }}
                }}
            }});

            function startCallProcess() {{
                let attempts = 0;
                const interval = setInterval(() => {{
                    attempts++;
                    const shadow = widget.shadowRoot;
                    const btn = shadow?.querySelector('button');
                    
                    if (btn && btn.offsetHeight > 0) {{
                        console.log("A11yson Widget: Calling...");
                        btn.click();
                        clearInterval(interval);
                    }}

                    if (attempts > 60) {{
                        clearInterval(interval);
                    }}
                }}, 300);
            }}

            // Start anyway if context message doesn't arrive quickly
            setTimeout(() => {{
                if (!contextReady) {{
                    startCallProcess();
                }}
            }}, 3000);
        </script>
    </body>
    </html>
    """
    return html_content

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
