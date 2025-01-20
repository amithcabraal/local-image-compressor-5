import { ImageIcon } from 'lucide-react';
import { FileInfo, FileDetails } from '../types';

interface FileListProps {
  files: FileInfo[];
  selectedFile: FileDetails | null;
  onFileSelect: (file: FileInfo) => void;
}

export function FileList({ files, selectedFile, onFileSelect }: FileListProps) {
  return (
    <div className="lg:col-span-3 bg-gray-50 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Images</h2>
      <div className="space-y-2">
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => onFileSelect(file)}
            className={`w-full text-left p-2 rounded-lg transition-colors hover:bg-gray-200 ${
              selectedFile?.name === file.name ? 'bg-gray-200' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon size={16} />
              <span className="truncate">{file.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}