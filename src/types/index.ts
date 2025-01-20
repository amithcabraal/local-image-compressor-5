export type FilterType = 'none' | 'grayscale' | 'sepia';
export type AnchorPoint = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type CopyrightPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface FileInfo {
  name: string;
  file: File;
}

export interface FileDetails {
  name: string;
  original: string;
  compressed?: string;
  originalSize: number;
  compressedSize?: number;
  originalDimensions?: {
    width: number;
    height: number;
  };
  compressedDimensions?: {
    width: number;
    height: number;
  };
}

export const ASPECT_RATIOS = {
  'custom': 0,
  '1:1': 1,
  '4:3': 4/3,
  '16:9': 16/9,
  '3:2': 3/2,
  '2:3': 2/3,
} as const;

export type AspectRatioType = keyof typeof ASPECT_RATIOS;