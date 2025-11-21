import React from 'react';
import { Download, ChevronLeft, Aperture } from 'lucide-react';

interface Props {
    hasImage: boolean;
    onReset: () => void;
    onDownload: () => void;
}

export const TopBar: React.FC<Props> = ({ hasImage, onReset, onDownload }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-fuji-black/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-2">
                {hasImage ? (
                    <button onClick={onReset} className="text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                ) : (
                    <div className="p-2 bg-fuji-accent rounded-lg">
                        <Aperture className="w-5 h-5 text-white" />
                    </div>
                )}
                <h1 className="font-bold text-lg tracking-widest text-white font-mono">
                    FUJI<span className="text-fuji-accent">FRAME</span>
                </h1>
            </div>

            {hasImage && (
                <button 
                    onClick={onDownload}
                    className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>
            )}
        </header>
    );
};