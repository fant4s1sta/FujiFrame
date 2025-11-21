import React, { useState, useEffect, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { FilterSelector } from './components/FilterSelector';
import { TopBar } from './components/TopBar';
import { WebGLRenderer } from './services/webgl-renderer';
import { FILTERS } from './constants';
import { Sliders } from 'lucide-react';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFilterId, setSelectedFilterId] = useState<string>(FILTERS[0].id);
  const [intensity, setIntensity] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Image Selection
  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageSrc(url);
      // Initial fit
      calculateCanvasSize(img);
    };
    img.src = url;
  };

  // Calculate fit-to-screen dimensions
  const calculateCanvasSize = (img: HTMLImageElement) => {
    if (!containerRef.current) return;
    
    // Available space (accounting for header and bottom bar)
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - 180; // approximate space for header + footer

    let width = img.width;
    let height = img.height;
    
    // Scale down if too big
    const aspectRatio = width / height;
    
    if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
            width = maxWidth;
            height = width / aspectRatio;
        } else {
            height = maxHeight;
            width = height * aspectRatio;
        }
    }
    
    setCanvasSize({ width, height });
  };

  // Initialize WebGL when image loads
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new WebGLRenderer(canvasRef.current);
    }
    
    if (rendererRef.current && imageRef.current) {
      rendererRef.current.setImage(imageRef.current);
      render();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize]);

  // Render loop trigger
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilterId, intensity]);

  const render = () => {
    if (!rendererRef.current) return;
    const preset = FILTERS.find(f => f.id === selectedFilterId) || FILTERS[0];
    rendererRef.current.render(preset, intensity);
  };

  const handleDownload = async () => {
    if (!imageRef.current) return;
    
    // 1. Create an off-screen canvas for full resolution
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageRef.current.width;
    tempCanvas.height = imageRef.current.height;
    
    // 2. Initialize a temporary renderer
    const tempRenderer = new WebGLRenderer(tempCanvas);
    tempRenderer.setImage(imageRef.current);
    
    // 3. Get current preset settings
    const preset = FILTERS.find(f => f.id === selectedFilterId) || FILTERS[0];
    
    // 4. Render at full resolution
    tempRenderer.render(preset, intensity);
    
    // 5. Download
    const link = document.createElement('a');
    link.download = `fujiframe_${selectedFilterId}_${Date.now()}.jpg`;
    // High quality JPEG
    link.href = tempCanvas.toDataURL('image/jpeg', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    tempCanvas.remove();
  };

  const handleReset = () => {
    setImageSrc(null);
    imageRef.current = null;
    setSelectedFilterId(FILTERS[0].id);
  };

  return (
    <div className="flex flex-col h-full bg-fuji-black text-white">
      <TopBar 
        hasImage={!!imageSrc} 
        onReset={handleReset} 
        onDownload={handleDownload} 
      />

      <main className="flex-1 relative overflow-hidden pt-16 pb-32 flex items-center justify-center" ref={containerRef}>
        {!imageSrc && <ImageUploader onImageSelect={handleImageSelect} />}
        
        {imageSrc && (
          <div className="relative shadow-2xl shadow-black/50">
             <canvas 
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="max-w-full max-h-full object-contain bg-gray-900"
             />
          </div>
        )}
      </main>

      {imageSrc && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-fuji-black/95 border-t border-gray-800 shadow-2xl">
           {/* Intensity Control - Toggleable */}
           {showControls && (
             <div className="px-6 py-4 flex items-center gap-4 animate-slide-up border-b border-gray-800">
                <span className="text-xs font-bold text-gray-400 w-16">INTENSITY</span>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuji-accent"
                />
                <span className="text-xs font-mono text-white w-8 text-right">{(intensity * 100).toFixed(0)}%</span>
             </div>
           )}

           <div className="flex flex-col">
               <div className="flex justify-between items-center px-4 pt-2 pb-1">
                   <span className="text-[10px] uppercase tracking-widest text-gray-500">Film Simulation</span>
                   <button 
                    onClick={() => setShowControls(!showControls)}
                    className={`p-2 rounded-full transition-colors ${showControls ? 'text-fuji-accent bg-fuji-accent/10' : 'text-gray-400 hover:text-white'}`}
                   >
                       <Sliders className="w-4 h-4" />
                   </button>
               </div>
               <FilterSelector 
                    selectedId={selectedFilterId} 
                    onSelect={setSelectedFilterId} 
               />
           </div>
        </div>
      )}
    </div>
  );
};

export default App;