import React, { useState, useEffect } from 'react';
import type { ArticleData, OverlaySettings } from '../types';
import { getCleanParagraphs } from '../utils/contentCleaner';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const CleanMode: React.FC<Props> = ({ article, settings }) => {
    const [paragraphs, setParagraphs] = useState<string[]>([]);

    useEffect(() => {
        setParagraphs(getCleanParagraphs(article.content));
    }, [article.content]);

    return (
        <div className="h-full overflow-y-auto bg-white selection:bg-slate-100" style={{ fontSize: `${settings.fontSize}px` }}>
            <div className="max-w-4xl mx-auto px-16 py-20 pb-40">
                <header className="mb-14 pb-10 border-b border-slate-100 flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs"></span>
                        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Universal Clean Reader</h2>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        {article.title}
                    </h1>
                </header>

                <main className="flex flex-col gap-10">
                    {paragraphs.map((para, i) => (
                        <p
                            key={i}
                            className="text-slate-800 leading-[1.8] text-xl font-normal max-w-[70ch]"
                        >
                            {para}
                        </p>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default CleanMode;
