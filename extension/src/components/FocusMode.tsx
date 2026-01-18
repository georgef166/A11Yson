import React, { useState, useEffect } from 'react';
import { textVide } from 'text-vide';
import type { ArticleData, OverlaySettings } from '../types';
import { getCleanParagraphs } from '../utils/contentCleaner';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const FocusMode: React.FC<Props> = ({ article, settings }) => {
    const [timer, setTimer] = useState<number>(25 * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [paragraphs, setParagraphs] = useState<string[]>([]);

    useEffect(() => {
        setParagraphs(getCleanParagraphs(article.content));
    }, [article.content]);

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
        <div className="relative h-full overflow-y-auto bg-[#f8fafc] selection:bg-blue-100" style={{ fontSize: `${settings.fontSize}px` }}>
            {/* ADHD Vignette Effect */}
            <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.05)] z-0" />

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                {/* Header Section */}
                <div className="w-full flex justify-between items-center py-6 px-12 sticky top-0 bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200/60 transition-all">
                    <div>
                        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">ADHD Reading Mode</h2>
                        <p className="text-slate-400 text-xs">Minimized distractions • Bionic focus</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-3 transition-all ${timerActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                            <span className="font-mono text-sm font-bold">{formatTime(timer)}</span>
                            <button
                                onClick={() => setTimerActive(!timerActive)}
                                className="text-[10px] font-black uppercase tracking-widest hover:text-blue-200 transition-colors"
                            >
                                {timerActive ? 'Stop' : 'Start'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="my-12 px-12 w-full">
                    <div className="bg-white p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                        {/* Decorative side accent */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600/10" />

                        <h1 className="text-4xl font-black text-slate-900 mb-12 leading-[1.1] tracking-tight">
                            {article.title}
                        </h1>

                        <div className="space-y-8">
                            {paragraphs.map((para, i) => (
                                <div
                                    key={i}
                                    className="text-slate-700 leading-[1.8] max-w-[65ch] text-lg font-medium tracking-wide focus-within:text-slate-900 transition-colors"
                                    dangerouslySetInnerHTML={{ __html: textVide(para) }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusMode;
