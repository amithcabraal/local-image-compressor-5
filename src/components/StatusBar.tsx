import { FileDetails } from '../types';

interface StatusBarProps {
  selectedFile: FileDetails;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function StatusBar({ selectedFile }: StatusBarProps) {
  const originalSize = formatFileSize(selectedFile.originalSize);
  const compressedSize = selectedFile.compressedSize ? formatFileSize(selectedFile.compressedSize) : null;
  const compressionRatio = selectedFile.compressedSize 
    ? ((1 - selectedFile.compressedSize / selectedFile.originalSize) * 100).toFixed(1)
    : null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900">Original</h3>
        <p>Size: {originalSize}</p>
        {selectedFile.originalDimensions && (
          <p>Dimensions: {selectedFile.originalDimensions.width} × {selectedFile.originalDimensions.height}px</p>
        )}
      </div>
      
      {selectedFile.compressed && (
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900">Compressed</h3>
          <p>Size: {compressedSize}</p>
          {selectedFile.compressedDimensions && (
            <p>Dimensions: {selectedFile.compressedDimensions.width} × {selectedFile.compressedDimensions.height}px</p>
          )}
          <p className="text-green-600">Saved: {compressionRatio}%</p>
        </div>
      )}
    </div>
  );
}