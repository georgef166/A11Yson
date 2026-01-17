// Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log("A11yson Extension Installed");
  // Initialize default settings
  chrome.storage.local.set({
      a11yson_settings: {
          theme: 'default',
          images: 'allowed',
          tts_voice: 'default'
      }
  });
});

// Listener for context menu or content script TTS requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "speak_text") {
        playTTS(request.text);
    }
});

async function playTTS(text) {
    try {
        console.log("Requesting TTS for:", text);
        // Call our backend API
        const response = await fetch("http://localhost:8000/api/tts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });
        
        const data = await response.json();
        const audioUrl = data.audio_url;

        // In a real extension, we might need to play audio via an offscreen document or standard audio API
        // For prototype, we might just log or try to use Chrome TTS API as fallback
        
        // chrome.tts.speak(text); // Fallback to native
        
        console.log("Audio URL received:", audioUrl);
    } catch (error) {
        console.error("TTS Error:", error);
    }
}
