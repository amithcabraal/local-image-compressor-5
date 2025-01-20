import { useCallback } from 'react';
import { FilterType, AnchorPoint, CopyrightPosition } from '../types';

export function useImageProcessor() {
  const applyFilter = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, filter: FilterType) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (filter === 'grayscale') {
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      } else if (filter === 'sepia') {
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  const applyCrop = useCallback((sourceCanvas: HTMLCanvasElement, crop: any, anchor: AnchorPoint) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return sourceCanvas;

    canvas.width = crop.width;
    canvas.height = crop.height;

    let sourceX = crop.x;
    let sourceY = crop.y;

    switch (anchor) {
      case 'top-left':
        break;
      case 'top-right':
        sourceX = sourceCanvas.width - crop.width - crop.x;
        break;
      case 'bottom-left':
        sourceY = sourceCanvas.height - crop.height - crop.y;
        break;
      case 'bottom-right':
        sourceX = sourceCanvas.width - crop.width - crop.x;
        sourceY = sourceCanvas.height - crop.height - crop.y;
        break;
      case 'center':
        sourceX = (sourceCanvas.width - crop.width) / 2;
        sourceY = (sourceCanvas.height - crop.height) / 2;
        break;
    }

    ctx.drawImage(
      sourceCanvas,
      sourceX,
      sourceY,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas;
  }, []);

  const applyCopyright = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, text: string, position: CopyrightPosition) => {
    const padding = Math.min(width, height) * 0.02; // 2% padding
    const fontSize = Math.max(12, Math.min(width, height) * 0.03); // 3% of smallest dimension
    const copyrightText = `© ${text}`;
    
    ctx.font = `${fontSize}px Arial`;
    const textMetrics = ctx.measureText(copyrightText);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    // Create background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    
    let x = 0;
    let y = 0;
    
    switch (position) {
      case 'top-left':
        x = padding;
        y = padding;
        break;
      case 'top-right':
        x = width - textWidth - padding * 2;
        y = padding;
        break;
      case 'bottom-left':
        x = padding;
        y = height - textHeight - padding;
        break;
      case 'bottom-right':
        x = width - textWidth - padding * 2;
        y = height - textHeight - padding;
        break;
    }

    // Draw background rectangle
    ctx.fillRect(x - padding, y - padding, textWidth + padding * 2, textHeight + padding * 2);

    // Draw text
    ctx.fillStyle = 'white';
    ctx.fillText(copyrightText, x, y + textHeight * 0.8);
  }, []);

  return {
    applyFilter,
    applyCrop,
    applyCopyright,
  };
}