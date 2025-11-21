import React from 'react';
import { FILTERS } from '../constants';
import { FilterPreset } from '../types';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const FilterSelector: React.FC<Props> = ({ selectedId, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-4 pt-2 bg-fuji-black/90 backdrop-blur-md border-t border-gray-800">
      <div className="flex gap-3 px-4 min-w-max">
        {FILTERS.map((filter) => {
            const isSelected = selectedId === filter.id;
            return (
                <button
                key={filter.id}
                onClick={() => onSelect(filter.id)}
                className={`
                    relative group flex flex-col items-center gap-2 p-1 transition-all duration-300
                `}
                >
                <div className={`
                    w-20 h-20 rounded-xl border-2 overflow-hidden transition-all duration-300
                    ${isSelected ? 'border-fuji-accent scale-105 shadow-[0_0_15px_rgba(224,93,68,0.4)]' : 'border-transparent hover:border-gray-500'}
                `}>
                    {/* Preview approximation - just a colored block for UI speed, real preview is on canvas */}
                    <div 
                        className="w-full h-full bg-gray-700"
                        style={{
                            backgroundColor: filter.grayscale ? '#333' : (filter.saturation > 1.1 ? '#543' : '#444'),
                            filter: `contrast(${filter.contrast}) brightness(${1 + filter.brightness})`
                        }}
                    >
                       <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono opacity-50">
                           {filter.name.split('/')[0].substring(0,3)}
                       </div>
                    </div>
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isSelected ? 'text-fuji-accent' : 'text-gray-400'}`}>
                    {filter.name.split(' / ')[1] || filter.name}
                </span>
                </button>
            );
        })}
      </div>
    </div>
  );
};
