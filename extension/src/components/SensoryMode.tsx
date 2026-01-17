import React from 'react';
import type { ArticleData, OverlaySettings } from '../types';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const SensoryMode: React.FC<Props> = ({ article, settings }) => {
    return (
        <div className="animate-in fade-in duration-300 h-full overflow-y-auto bg-gray-900" style={{ fontSize: `${settings.fontSize}px` }}>
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-900/95 backdrop-blur py-4 border-b border-gray-800 z-10 px-8">
                <div>
                    <h2 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-1">Sensory Safe</h2>
                    <p className="text-gray-400 text-sm">Dark mode with simplified structure.</p>
                </div>
            </div>

            <div className="px-8 pb-12 text-gray-300">
                <h1 className="text-3xl font-bold mb-8 text-gray-100">{article.title}</h1>
                <div className="prose prose-invert prose-lg max-w-none">
                    {article.textContent.split('\n').map((para, i) => (
                        para.trim() && <p key={i} className="mb-6 leading-loose">{para}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SensoryMode;
