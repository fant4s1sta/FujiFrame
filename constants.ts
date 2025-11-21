import { FilterPreset } from './types';

const DEFAULT_MATRIX = {
  r: [1, 0, 0],
  g: [0, 1, 0],
  b: [0, 0, 1],
} as const;

export const FILTERS: FilterPreset[] = [
  {
    id: 'provia',
    name: 'STD / PROVIA',
    description: 'Standard. Neutral color reproduction.',
    saturation: 1.05,
    contrast: 1.02,
    brightness: 0.0,
    warmth: 0.0,
    tint: 0.0,
    vignette: 0.0,
    grain: 0.05,
    channelMix: DEFAULT_MATRIX,
    grayscale: false,
  },
  {
    id: 'velvia',
    name: 'VIVID / VELVIA',
    description: 'Vibrant colors with high contrast. Great for landscapes.',
    saturation: 1.4,
    contrast: 1.15,
    brightness: -0.02,
    warmth: 0.05,
    tint: 0.1, // Slight magenta shift
    vignette: 0.15,
    grain: 0.10,
    channelMix: {
        r: [1.1, -0.1, 0.0],
        g: [0.0, 1.1, -0.1],
        b: [0.0, 0.0, 1.1]
    },
    grayscale: false,
  },
  {
    id: 'astia',
    name: 'SOFT / ASTIA',
    description: 'Soft tones and low contrast. Ideal for portraits.',
    saturation: 1.05,
    contrast: 0.95,
    brightness: 0.05,
    warmth: 0.05,
    tint: -0.05,
    vignette: 0.05,
    grain: 0.02,
    channelMix: {
        r: [0.95, 0.05, 0.0],
        g: [0.0, 1.0, 0.0],
        b: [0.0, 0.05, 0.95]
    },
    grayscale: false,
  },
  {
    id: 'classic_chrome',
    name: 'CLASSIC CHROME',
    description: 'Documentary look. Muted colors and hard tonality.',
    saturation: 0.75,
    contrast: 1.15,
    brightness: -0.05,
    warmth: -0.1, // Cool
    tint: -0.1,   // Green/Cyan shift
    vignette: 0.3,
    grain: 0.25,
    channelMix: {
        r: [0.9, 0.1, 0.0], // Pull reds
        g: [0.0, 1.0, 0.0],
        b: [0.1, 0.1, 0.8]  // Shift blues to cyan
    },
    grayscale: false,
  },
  {
    id: 'pro_neg_hi',
    name: 'PRO NEG. Hi',
    description: 'Good contrast for portraits with slightly desaturated look.',
    saturation: 0.9,
    contrast: 1.08,
    brightness: 0.0,
    warmth: 0.0,
    tint: 0.0,
    vignette: 0.1,
    grain: 0.15,
    channelMix: DEFAULT_MATRIX,
    grayscale: false,
  },
  {
    id: 'pro_neg_std',
    name: 'PRO NEG. Std',
    description: 'Very soft tonality with low saturation. Studio lighting.',
    saturation: 0.85,
    contrast: 0.9,
    brightness: 0.02,
    warmth: 0.02,
    tint: 0.0,
    vignette: 0.0,
    grain: 0.05,
    channelMix: DEFAULT_MATRIX,
    grayscale: false,
  },
  {
    id: 'classic_neg',
    name: 'CLASSIC NEG',
    description: 'Superia-like. Hard contrast, nostalgic colors.',
    saturation: 0.85,
    contrast: 1.25,
    brightness: -0.05,
    warmth: 0.15,
    tint: 0.2, // Distinct magenta/green separation
    vignette: 0.35,
    grain: 0.35,
    channelMix: {
        r: [1.1, -0.2, 0.1],
        g: [-0.1, 1.1, 0.0],
        b: [0.0, 0.1, 0.9]
    },
    grayscale: false,
  },
  {
    id: 'eterna',
    name: 'ETERNA',
    description: 'Cinema look. Extremely low contrast and saturation.',
    saturation: 0.65,
    contrast: 0.8,
    brightness: 0.1,
    warmth: 0.0,
    tint: 0.0,
    vignette: 0.1,
    grain: 0.1,
    channelMix: {
        r: [0.9, 0.1, 0.0],
        g: [0.05, 0.9, 0.05],
        b: [0.0, 0.1, 0.9]
    },
    grayscale: false,
  },
  {
    id: 'acros',
    name: 'ACROS',
    description: 'Rich detail, sharp black and white with distinct grain.',
    saturation: 0.0,
    contrast: 1.2,
    brightness: 0.0,
    warmth: 0.0,
    tint: 0.0,
    vignette: 0.25,
    grain: 0.3,
    channelMix: { // Spectral sensitivity approximation of Acros
        r: [0.3, 0.6, 0.1], 
        g: [0.3, 0.6, 0.1], 
        b: [0.3, 0.6, 0.1]
    },
    grayscale: true,
  },
  {
    id: 'acros_r',
    name: 'ACROS+R',
    description: 'Acros with Red Filter. Darker skies, higher contrast.',
    saturation: 0.0,
    contrast: 1.35,
    brightness: -0.05,
    warmth: 0.0,
    tint: 0.0,
    vignette: 0.3,
    grain: 0.3,
    channelMix: { 
        r: [0.8, 0.2, 0.0], // Heavily weighted to red
        g: [0.8, 0.2, 0.0], 
        b: [0.8, 0.2, 0.0]
    },
    grayscale: true,
  }
];
