export interface ColorMatrix {
  r: readonly [number, number, number];
  g: readonly [number, number, number];
  b: readonly [number, number, number];
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  // Simulation Parameters
  saturation: number; // 1.0 is normal
  contrast: number;   // 1.0 is normal
  brightness: number; // 0.0 is normal
  warmth: number;     // 0.0 is normal
  tint: number;       // 0.0 is normal
  vignette: number;   // 0.0 to 1.0
  grain: number;      // 0.0 to 1.0
  channelMix: ColorMatrix; // RGB Channel mixing
  grayscale: boolean;
}

export interface AppState {
  imageSrc: string | null;
  originalImage: HTMLImageElement | null;
  selectedFilterId: string;
  intensity: number; // 0 to 1
}