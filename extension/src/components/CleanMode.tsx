import React from 'react';
import type { ArticleData, OverlaySettings } from '../types';

interface Props {
    article: ArticleData;
    settings: OverlaySettings;
}

const CleanMode: React.FC<Props> = ({ article, settings }) => {
    // Image blocking is now handled globally in Overlay.tsx via settings.hideImages

    return (
        <div className="animate-in fade-in duration-300 h-full overflow-y-auto bg-white" style={{ fontSize: `${settings.fontSize}px` }}>
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/95 backdrop-blur py-4 border-b border-gray-100 z-10 px-8">
                <div>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Clean Reader</h2>
                    <p className="text-gray-500 text-sm">Distraction-free reading view.</p>
                </div>
                {/* Image Toggle is now in Extension Popup */}
            </div>

            <div className="px-8 pb-12">
                <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">{article.title}</h1>
                <div
                    className="prose prose-xl max-w-none text-gray-800 font-serif"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </div>
        </div>
    );
};

export default CleanMode;
