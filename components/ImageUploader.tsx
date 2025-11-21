import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<Props> = ({ onImageSelect }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
  };

  return (
    <div 
        className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
    >
      <div className="bg-fuji-dark border-2 border-dashed border-gray-600 rounded-3xl p-8 md:p-16 flex flex-col items-center gap-4 max-w-md w-full shadow-2xl">
        <div className="bg-fuji-black p-4 rounded-full mb-2">
          <ImageIcon className="w-12 h-12 text-fuji-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white">Load Photo</h2>
        <p className="text-gray-400 mb-4">Select a photo to apply Film Simulation</p>
        
        <label className="relative cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <div className="flex items-center gap-2 bg-fuji-accent hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-all transform active:scale-95 shadow-lg">
            <Upload className="w-5 h-5" />
            <span>Select from Library</span>
          </div>
        </label>
        <p className="text-xs text-gray-500 mt-4">Supports JPG, PNG, WEBP</p>
      </div>
    </div>
  );
};
