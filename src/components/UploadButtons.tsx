import { FolderOpen, Upload } from 'lucide-react';

interface UploadButtonsProps {
  isLoading: boolean;
  isFileSystemApiSupported: boolean;
  directoryHandle: FileSystemDirectoryHandle | null;
  onDirectorySelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  zipInputRef: React.RefObject<HTMLInputElement>;
}

export function UploadButtons({
  isLoading,
  isFileSystemApiSupported,
  directoryHandle,
  onDirectorySelect,
  fileInputRef,
  zipInputRef,
}: UploadButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {isFileSystemApiSupported && (
        <button
          onClick={onDirectorySelect}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          <FolderOpen size={20} />
          {isLoading ? 'Loading...' : directoryHandle ? 'Change Directory' : 'Select Directory'}
        </button>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        <Upload size={20} />
        Upload Images
      </button>

      <button
        onClick={() => zipInputRef.current?.click()}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        <Upload size={20} />
        Upload ZIP
      </button>
    </div>
  );
}