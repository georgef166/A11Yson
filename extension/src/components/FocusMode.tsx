import React, { useState, useEffect } from 'react';
import { textVide } from 'text-vide';
import type { ArticleData, OverlaySettings } from '../types';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const FocusMode: React.FC<Props> = ({ article, settings }) => {
    const [timer, setTimer] = useState<number>(25 * 60);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        let interval: any;
        if (timerActive && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="animate-in fade-in duration-300 h-full overflow-y-auto bg-white" style={{ fontSize: `${settings.fontSize}px` }}>
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/95 backdrop-blur py-4 border-b border-gray-100 z-10 px-8">
                <div>
                    <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Bionic Reading Mode</h2>
                    <p className="text-gray-500 text-sm">Bolded letters help guide your eye movement.</p>
                </div>
                <button
                    onClick={() => setTimerActive(!timerActive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm font-bold border ${timerActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                    <span>{timerActive ? '⏸ Pause' : '▶ Start Timer'}</span>
                    <span className="text-lg">{formatTime(timer)}</span>
                </button>
            </div>

            <div className="px-8 pb-12">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 leading-tight">{article.title}</h1>
                <div
                    className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: textVide(article.textContent) }}
                />
            </div>
        </div>
    );
};

export default FocusMode;
