import { Download } from 'lucide-react';
import { FileDetails } from '../types';

interface DownloadButtonProps {
  selectedFile: FileDetails;
}

export function DownloadButton({ selectedFile }: DownloadButtonProps) {
  if (!selectedFile.compressed) return null;

  return (
    <div className="flex justify-end">
      <a
        href={selectedFile.compressed}
        download={`compressed-${selectedFile.name}`}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        <Download size={20} />
        Download
      </a>
    </div>
  );
}