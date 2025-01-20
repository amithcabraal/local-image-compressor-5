import { CropIcon, Trash2 } from 'lucide-react';
import { FilterType, AnchorPoint, ASPECT_RATIOS, AspectRatioType, CopyrightPosition } from '../types';

interface ImageEffectsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  isCropping: boolean;
  setIsCropping: (cropping: boolean) => void;
  aspectRatio: AspectRatioType;
  handleAspectRatioChange: (ratio: AspectRatioType) => void;
  customAspectRatio: { width: number; height: number };
  handleCustomAspectRatioChange: (width: number, height: number) => void;
  anchorPoint: AnchorPoint;
  setAnchorPoint: (point: AnchorPoint) => void;
  copyrightText: string;
  setCopyrightText: (text: string) => void;
  copyrightPosition: CopyrightPosition;
  setCopyrightPosition: (position: CopyrightPosition) => void;
  onRemoveCrop: () => void;
  onApplyChanges: () => void;
}

export function ImageEffects({
  filter,
  setFilter,
  watermarkText,
  setWatermarkText,
  isCropping,
  setIsCropping,
  aspectRatio,
  handleAspectRatioChange,
  customAspectRatio,
  handleCustomAspectRatioChange,
  anchorPoint,
  setAnchorPoint,
  copyrightText,
  setCopyrightText,
  copyrightPosition,
  setCopyrightPosition,
  onRemoveCrop,
  onApplyChanges,
}: ImageEffectsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Effects</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="none">None</option>
            <option value="grayscale">Grayscale</option>
            <option value="sepia">Sepia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Watermark
          </label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="Enter watermark text"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Copyright Text
          </label>
          <input
            type="text"
            value={copyrightText}
            onChange={(e) => setCopyrightText(e.target.value)}
            placeholder="Enter copyright text"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mb-2"
          />
          <select
            value={copyrightPosition}
            onChange={(e) => setCopyrightPosition(e.target.value as CopyrightPosition)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crop
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setIsCropping(!isCropping)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  isCropping
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                <CropIcon size={16} />
                {isCropping ? 'Finish Cropping' : 'Start Cropping'}
              </button>
              
              <button
                onClick={onRemoveCrop}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <Trash2 size={16} />
                Remove Crop
              </button>
            </div>

            {isCropping && (
              <>
                <select
                  value={aspectRatio}
                  onChange={(e) => handleAspectRatioChange(e.target.value as AspectRatioType)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="custom">Custom</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="4:3">4:3 Standard</option>
                  <option value="16:9">16:9 Widescreen</option>
                  <option value="3:2">3:2 Classic</option>
                  <option value="2:3">2:3 Portrait</option>
                </select>

                {aspectRatio === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={customAspectRatio.width}
                      onChange={(e) => handleCustomAspectRatioChange(parseInt(e.target.value), customAspectRatio.height)}
                      min="1"
                      placeholder="Width"
                      className="rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <input
                      type="number"
                      value={customAspectRatio.height}
                      onChange={(e) => handleCustomAspectRatioChange(customAspectRatio.width, parseInt(e.target.value))}
                      min="1"
                      placeholder="Height"
                      className="rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                )}

                <select
                  value={anchorPoint}
                  onChange={(e) => setAnchorPoint(e.target.value as AnchorPoint)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="center">Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onApplyChanges}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}