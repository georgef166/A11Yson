import React, { useEffect, useState } from 'react';
import type { ArticleData, OverlaySettings } from '../types';
import { getCleanParagraphs } from '../utils/contentCleaner';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const SensoryMode: React.FC<Props> = ({ article, settings }) => {
    const [paragraphs, setParagraphs] = useState<string[]>([]);

    useEffect(() => {
        setParagraphs(getCleanParagraphs(article.content));
    }, [article.content]);

    return (
        <div className="h-full overflow-y-auto bg-[#1a1c1e] text-[#a0aab4]" style={{ fontSize: `${settings.fontSize}px` }}>
            <div className="max-w-3xl mx-auto px-12 py-20">
                <header className="mb-16 border-l-4 border-[#3c444c] pl-8">
                    <h2 className="text-[10px] font-bold text-[#5c646c] uppercase tracking-[0.3em] mb-4">Sensory Support Mode</h2>
                    <h1 className="text-3xl font-medium text-[#e2e8f0] leading-snug">
                        {article.title}
                    </h1>
                </header>

                <main className="space-y-10">
                    {paragraphs.map((para, i) => (
                        <p
                            key={i}
                            className="leading-relaxed text-lg font-normal tracking-normal opacity-90 hover:opacity-100 transition-opacity duration-700"
                        >
                            {para}
                        </p>
                    ))}
                </main>

                <footer className="mt-20 pt-10 border-t border-[#3c444c] text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#5c646c]">End of Content • Neutral Environment Active</p>
                </footer>
            </div>
        </div>
    );
};

export default SensoryMode;
