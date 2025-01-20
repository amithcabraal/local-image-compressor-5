interface CompressionOptionsProps {
  quality: number;
  setQuality: (quality: number) => void;
  outputSize: number;
  setOutputSize: (size: number) => void;
  format: string;
  setFormat: (format: string) => void;
}

export function CompressionOptions({
  quality,
  setQuality,
  outputSize,
  setOutputSize,
  format,
  setFormat,
}: CompressionOptionsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Compression</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quality ({Math.round(quality * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Output Size ({outputSize}%)
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={outputSize}
            onChange={(e) => setOutputSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="webp">WebP</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>
    </div>
  );
}