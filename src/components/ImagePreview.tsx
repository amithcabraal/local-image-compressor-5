import { SplitSquareHorizontal as SplitHorizontal } from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import ReactCrop, { Crop } from 'react-image-crop';
import { FileDetails } from '../types';
import { StatusBar } from './StatusBar';

interface ImagePreviewProps {
  selectedFile: FileDetails;
  viewMode: 'preview' | 'compare';
  setViewMode: (mode: 'preview' | 'compare') => void;
  isCropping: boolean;
  crop: Crop | undefined;
  setCrop: (crop: Crop) => void;
  setCompletedCrop: (crop: any) => void;
  imgRef: React.RefObject<HTMLImageElement>;
  aspectRatio: number;
}

export function ImagePreview({
  selectedFile,
  viewMode,
  setViewMode,
  isCropping,
  crop,
  setCrop,
  setCompletedCrop,
  imgRef,
  aspectRatio,
}: ImagePreviewProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Preview</h2>
        <button
          onClick={() => setViewMode(viewMode === 'preview' ? 'compare' : 'preview')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <SplitHorizontal size={16} />
          {viewMode === 'preview' ? 'Compare' : 'Preview'}
        </button>
      </div>

      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {viewMode === 'preview' ? (
          isCropping ? (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
            >
              <img
                ref={imgRef}
                src={selectedFile.original}
                alt="Original"
                className="max-h-full mx-auto"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  selectedFile.originalDimensions = {
                    width: img.naturalWidth,
                    height: img.naturalHeight
                  };
                }}
              />
            </ReactCrop>
          ) : (
            <img
              src={selectedFile.compressed || selectedFile.original}
              alt="Preview"
              className="max-h-full mx-auto"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (selectedFile.compressed) {
                  selectedFile.compressedDimensions = {
                    width: img.naturalWidth,
                    height: img.naturalHeight
                  };
                }
              }}
            />
          )
        ) : (
          <ReactCompareSlider
            itemOne={
              <ReactCompareSliderImage 
                src={selectedFile.original} 
                alt="Original" 
              />
            }
            itemTwo={
              <ReactCompareSliderImage 
                src={selectedFile.compressed || selectedFile.original} 
                alt="Processed" 
              />
            }
          />
        )}
      </div>

      <StatusBar selectedFile={selectedFile} />
    </div>
  );
}