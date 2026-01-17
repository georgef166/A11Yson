import React, { useState } from 'react';
import '@fontsource/opendyslexic';
import type { ArticleData, OverlaySettings } from '../types';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const DyslexiaMode: React.FC<Props> = ({ article, settings }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const playTTS = async (text: string) => {
        if (isPlaying) {
            setIsPlaying(false);
            return;
        }
        setIsPlaying(true);
        try {
            const textToSpeed = text.substring(0, 500);
            const response = await fetch('http://localhost:8000/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeed })
            });

            if (!response.ok) throw new Error("TTS Failed");

            const blob = await response.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.onended = () => setIsPlaying(false);
            audio.play();
        } catch (e) {
            console.error(e);
            setIsPlaying(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300 mode-dyslexia font-dyslexic group h-full overflow-y-auto bg-[#fffff0]" style={{ letterSpacing: '0.15em', lineHeight: '2.5', fontSize: `${settings.fontSize}px` }}>
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#fffff0]/95 backdrop-blur py-4 border-b border-yellow-200 z-10 px-8">
                <div>
                    <h2 className="text-sm font-bold text-yellow-800 uppercase tracking-widest mb-1">Dyslexia Friendly</h2>
                    <p className="text-yellow-700 text-sm">OpenDyslexic font with increased spacing.</p>
                </div>
                <button
                    onClick={() => playTTS(article.textContent)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm transition-all ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'}`}
                >
                    {isPlaying ? '⏹ Stop Audio' : '🔊 Listen to Article'}
                </button>
            </div>

            {/* Ruler */}
            <div
                className="bg-yellow-400/20 border-y-2 border-yellow-500/30 h-16 w-full fixed pointer-events-none hidden group-hover:block mix-blend-multiply z-20"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                ref={(el) => {
                    if (el && typeof window !== 'undefined') {
                        const onMove = (e: MouseEvent) => { el.style.top = `${e.clientY - 32}px`; };
                        window.addEventListener('mousemove', onMove);
                        return () => window.removeEventListener('mousemove', onMove);
                    }
                }}
            >
                <span className="absolute right-2 bottom-1 text-xs font-bold text-yellow-700 uppercase opacity-50">Reading Guide</span>
            </div>

            <div className="px-8 pb-12">
                <h1 className="text-4xl font-bold mb-8 text-black">{article.title}</h1>
                <div
                    className="prose prose-xl max-w-none text-black"
                    dangerouslySetInnerHTML={{ __html: article.textContent }}
                />
            </div>
        </div>
    );
};

export default DyslexiaMode;
