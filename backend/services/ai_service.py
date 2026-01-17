import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ElevenLabs Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

async def analyze_profile(quiz_data: dict) -> dict:
    """
    Uses OpenRouter (Gemini via API) to analyze quiz answers and generate a cognitive accessibility profile.
    Or returns a mock profile if API key is missing/fails.
    """
    # Quick mock fallback since we might not have an OpenRouter Key
    if not OPENROUTER_API_KEY:
        print("Using Mock Profile (OpenRouter Key Missing)")
        return {
            "primary_condition": "ADHD", 
            "recommended_font": "Inter",
            "contrast_preference": "dark-mode",
            "content_density": "chunked",
            "features": {
                "bionic_reading": True,
                "image_hiding": False,
                "tts_enabled": True,
                "reduce_motion": True
            },
            "voice_assistant_persona": "calm",
            "explanation": "Mock profile generated because OPENROUTER_API_KEY is missing."
        }

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000", # Optional but recommended
            "X-Title": "A11Yson" # Optional but recommended
        }
        
        prompt = f"""
        Analyze the following user quiz data for accessibility needs.
        The user answers relate to cognitive conditions like ADHD, Dyslexia, Autism, Anxiety, etc.
        
        Quiz Data:
        {quiz_data}
        
        Return a JSON object with the following structure:
        {{
            "primary_condition": "ADHD" | "Dyslexia" | "Anxiety" | "General",
            "recommended_font": "OpenDyslexic" | "Inter" | "Arial",
            "contrast_preference": "high-contrast" | "soft-yellow" | "dark-mode" | "default",
            "content_density": "compact" | "comfortable" | "chunked",
            "features": {{
                "bionic_reading": boolean,
                "image_hiding": boolean,
                "tts_enabled": boolean,
                "reduce_motion": boolean
            }},
            "voice_assistant_persona": "calm" | "energetic" | "slow-paced"
        }}
        Only return the JSON.
        """
        
        # List of models to try in order of preference
        models = [
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3-8b-instruct:free",
            "microsoft/phi-3-medium-128k-instruct:free",
            "mistralai/mistral-7b-instruct:free"
        ]
        
        last_exception = None
        content = None
        
        async with httpx.AsyncClient() as client:
            for model in models:
                try:
                    print(f"Trying AI Model: {model}")
                    data = {
                        "model": model,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ]
                    }
                    
                    resp = await client.post(url, json=data, headers=headers, timeout=30.0)
                    
                    if resp.status_code == 200:
                        response_json = resp.json()
                        if 'choices' in response_json and len(response_json['choices']) > 0:
                            content = response_json['choices'][0]['message']['content']
                            print(f"Success with model: {model}")
                            break
                        else:
                            print(f"Invalid response format from {model}: {response_json}")
                    else:
                        error_msg = f"Model {model} failed with status {resp.status_code}: {resp.text}"
                        print(error_msg)
                        last_exception = Exception(error_msg)
                        # If 429 (Rate Limit) or 5xx, continue to next model. 
                        # If 401 (Auth), it's likely a key issue and will fail for all.
                except Exception as ex:
                    print(f"Exception dealing with model {model}: {ex}")
                    last_exception = ex
                    continue
            
        if not content:
            raise Exception(f"All AI models failed. Last error: {last_exception}")
        
        # Basic cleanup to handle markdown json code blocks ```json ... ```
        clean_text = content.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        import json
        return json.loads(clean_text)
    except Exception as e:
        print(f"OpenRouter Error: {e}")
        # Fallback Mock on Error
        return {
            "primary_condition": "General",
            "recommended_font": "OpenDyslexic",
            "contrast_preference": "soft-yellow",
            "content_density": "comfortable",
            "features": {
                "bionic_reading": False,
                "image_hiding": False,
                "tts_enabled": True,
                "reduce_motion": False
            },
            "voice_assistant_persona": "friendly",
            "error": str(e)
        }

async def generate_speech(text: str) -> bytes:
    """
    Uses ElevenLabs to generate speech from text.
    """
    if not ELEVENLABS_API_KEY or not ELEVENLABS_VOICE_ID:
        raise ValueError("ElevenLabs credentials missing")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data, headers=headers)
        if response.status_code != 200:
            raise Exception(f"ElevenLabs Error: {response.text}")
        return response.content
