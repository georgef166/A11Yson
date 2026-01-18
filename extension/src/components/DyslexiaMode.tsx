import React, { useState, useEffect } from 'react';
import '@fontsource/opendyslexic';
import type { ArticleData, OverlaySettings } from '../types';
import { getCleanParagraphs } from '../utils/contentCleaner';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const DyslexiaMode: React.FC<Props> = ({ article, settings }) => {
    const [paragraphs, setParagraphs] = useState<string[]>([]);
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        setParagraphs(getCleanParagraphs(article.content));
    }, [article.content]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => setMouseY(e.clientY);
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative h-full overflow-y-auto bg-[#fdf6e3] selection:bg-[#eee8d5]" style={{ fontSize: `${settings.fontSize}px` }}>
            {/* Reading Ruler */}
            <div
                className="fixed left-0 right-0 h-12 bg-blue-400/10 border-y border-blue-400/20 pointer-events-none z-50 transition-all duration-75 mix-blend-multiply"
                style={{ top: mouseY - 24 }}
            />

            <div className="max-w-4xl mx-auto px-12 py-16">
                <header className="flex justify-between items-start mb-16 border-b-2 border-[#eee8d5] pb-8">
                    <div>
                        <h2 className="text-[10px] font-black text-[#b58900] uppercase tracking-[0.2em] mb-2">Dyslexia Optimized View</h2>
                        <h1 className="text-4xl font-black text-[#073642] leading-tight">
                            {article.title}
                        </h1>
                    </div>
                </header>

                <main className="space-y-12 font-dyslexic antialiased text-[#586e75]">
                    {paragraphs.map((para, i) => (
                        <p
                            key={i}
                            className="leading-[1.9] text-xl tracking-wider word-spacing-wide select-text"
                            style={{ wordSpacing: '0.15em' }}
                        >
                            {para}
                        </p>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default DyslexiaMode;
