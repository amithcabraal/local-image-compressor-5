import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { FileInfo, FileDetails, FilterType, AnchorPoint, AspectRatioType, ASPECT_RATIOS, CopyrightPosition } from './types';
import { FileList } from './components/FileList';
import { ImagePreview } from './components/ImagePreview';
import { CompressionOptions } from './components/CompressionOptions';
import { ImageEffects } from './components/ImageEffects';
import { UploadButtons } from './components/UploadButtons';
import { DownloadButton } from './components/DownloadButton';
import { useImageProcessor } from './hooks/useImageProcessor';
import 'react-image-crop/dist/ReactCrop.css';

function App() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [status, setStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'compare'>('preview');
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<string>('webp');
  const [outputSize, setOutputSize] = useState(100);
  const [isCompressingAll, setIsCompressingAll] = useState(false);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [copyrightText, setCopyrightText] = useState<string>('');
  const [copyrightPosition, setCopyrightPosition] = useState<CopyrightPosition>('bottom-right');
  const [filter, setFilter] = useState<FilterType>('none');
  const [isFileSystemApiSupported, setIsFileSystemApiSupported] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<any>();
  const [completedCrop, setCompletedCrop] = useState<any>();
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [customAspectRatio, setCustomAspectRatio] = useState({ width: 1, height: 1 });
  const [anchorPoint, setAnchorPoint] = useState<AnchorPoint>('center');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const { applyFilter, applyCrop, applyCopyright } = useImageProcessor();

  useEffect(() => {
    setIsFileSystemApiSupported('showDirectoryPicker' in window);
  }, []);

  const handleSelectDirectory = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      await loadFilesFromDirectory(handle);
    } catch (error) {
      console.error('Error selecting directory:', error);
      setStatus('Error selecting directory. Please try again.');
    }
  };

  const loadFilesFromDirectory = async (handle: FileSystemDirectoryHandle) => {
    setIsLoading(true);
    setFiles([]);
    try {
      const imageFiles: FileInfo[] = [];
      const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const ext = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
          if (IMAGE_EXTENSIONS.includes(ext)) {
            const file = await entry.getFile();
            imageFiles.push({ name: entry.name, file });
          }
        }
      }
      setFiles(imageFiles);
      setStatus(imageFiles.length > 0 
        ? `Loaded ${imageFiles.length} image(s)` 
        : 'No image files found in selected directory');
    } catch (error) {
      console.error('Error reading directory contents:', error);
      setStatus('Error reading directory contents. Please try again.');
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    setIsLoading(true);
    setFiles([]);

    const imageFiles: FileInfo[] = [];
    const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    for (const file of uploadedFiles) {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (IMAGE_EXTENSIONS.includes(ext)) {
        imageFiles.push({ name: file.name, file });
      }
    }

    setFiles(imageFiles);
    setStatus(imageFiles.length > 0 
      ? `Loaded ${imageFiles.length} image(s)` 
      : 'No valid image files found');
    setIsLoading(false);
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const zipFile = event.target.files?.[0];
    if (!zipFile) return;

    setIsLoading(true);
    setFiles([]);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);
      const imageFiles: FileInfo[] = [];
      const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

      for (const [filename, file] of Object.entries(contents.files)) {
        if (!file.dir) {
          const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
          if (IMAGE_EXTENSIONS.includes(ext)) {
            const blob = await file.async('blob');
            const imageFile = new File([blob], filename, { type: `image/${ext.slice(1)}` });
            imageFiles.push({ name: filename, file: imageFile });
          }
        }
      }

      setFiles(imageFiles);
      setStatus(imageFiles.length > 0 
        ? `Extracted ${imageFiles.length} image(s) from ZIP` 
        : 'No valid image files found in ZIP');
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      setStatus('Error processing ZIP file. Please try again.');
    }

    setIsLoading(false);
  };

  const handleFileSelect = async (file: FileInfo) => {
    try {
      const originalUrl = URL.createObjectURL(file.file);
      setSelectedFile({
        name: file.name,
        original: originalUrl,
        originalSize: file.file.size
      });
      
      const { url: compressedUrl, blob } = await compressImage(file.file);
      
      setSelectedFile(prev => prev ? {
        ...prev,
        compressed: compressedUrl,
        compressedSize: blob.size
      } : null);
    } catch (error) {
      console.error('Error processing file:', error);
      setStatus(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCompressAll = async () => {
    setIsCompressingAll(true);
    try {
      const zip = new JSZip();
      
      for (const file of files) {
        try {
          const { blob } = await compressImage(file.file);
          zip.file(file.name, blob);
        } catch (error) {
          console.error(`Error compressing ${file.name}:`, error);
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus('All images compressed and downloaded successfully');
    } catch (error) {
      console.error('Error compressing all images:', error);
      setStatus('Error compressing all images. Please try again.');
    }
    setIsCompressingAll(false);
  };

  const compressImage = useCallback(async (file: File): Promise<{ blob: Blob; url: string }> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      let objectUrl: string | null = null;
      
      try {
        objectUrl = URL.createObjectURL(file);
      } catch (error) {
        reject(new Error('Failed to create object URL for image'));
        return;
      }
      
      const cleanup = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };

      img.onload = () => {
        try {
          const scale = outputSize / 100;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          if (!ctx) {
            cleanup();
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          canvas.width = Math.max(1, Math.floor(img.width * scale));
          canvas.height = Math.max(1, Math.floor(img.height * scale));
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let processedCanvas = canvas;
          if (completedCrop) {
            processedCanvas = applyCrop(canvas, completedCrop, anchorPoint);
          }

          if (filter !== 'none') {
            applyFilter(processedCanvas.getContext('2d')!, processedCanvas.width, processedCanvas.height, filter);
          }
          
          if (watermarkText) {
            const ctx = processedCanvas.getContext('2d')!;
            const fontSize = Math.max(12, Math.min(processedCanvas.width, processedCanvas.height) / 20);
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = fontSize / 4;
            ctx.shadowOffsetX = fontSize / 8;
            ctx.shadowOffsetY = fontSize / 8;
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const angle = -Math.PI / 6;
            ctx.save();
            ctx.translate(processedCanvas.width / 2, processedCanvas.height / 2);
            ctx.rotate(angle);
            const pattern = 3;
            const spacing = Math.min(processedCanvas.width, processedCanvas.height) / 3;
            
            for (let i = -pattern; i <= pattern; i++) {
              for (let j = -pattern; j <= pattern; j++) {
                ctx.fillText(watermarkText, i * spacing, j * spacing);
              }
            }
            
            ctx.restore();
          }

          if (copyrightText) {
            applyCopyright(processedCanvas.getContext('2d')!, processedCanvas.width, processedCanvas.height, copyrightText, copyrightPosition);
          }
          
          processedCanvas.toBlob(
            (blob) => {
              cleanup();
              
              if (!blob) {
                reject(new Error('Failed to create compressed image'));
                return;
              }
              
              if (blob.size === 0) {
                reject(new Error('Compressed image is empty'));
                return;
              }
              
              let compressedUrl: string;
              try {
                compressedUrl = URL.createObjectURL(blob);
              } catch (error) {
                reject(new Error('Failed to create URL for compressed image'));
                return;
              }
              
              resolve({ blob, url: compressedUrl });
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          cleanup();
          reject(new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      img.onerror = () => {
        cleanup();
        reject(new Error('Failed to load image. The file might be corrupted or not a valid image.'));
      };
      
      img.src = objectUrl;
    });
  }, [quality, format, outputSize, watermarkText, copyrightText, copyrightPosition, filter, completedCrop, anchorPoint, applyCrop, applyFilter, applyCopyright]);

  const handleAspectRatioChange = (value: AspectRatioType) => {
    setAspectRatio(value);
    if (value !== 'custom') {
      setCrop(undefined);
      setCompletedCrop(undefined);
      const ratio = ASPECT_RATIOS[value];
      setCrop({
        unit: '%',
        width: 90,
        height: 90 / ratio,
        x: 5,
        y: 5,
      });
    }
  };

  const handleCustomAspectRatioChange = (width: number, height: number) => {
    setCustomAspectRatio({ width, height });
    if (aspectRatio === 'custom') {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setCrop({
        unit: '%',
        width: 90,
        height: 90 * (height / width),
        x: 5,
        y: 5,
      });
    }
  };

  const handleRemoveCrop = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsCropping(false);
  };

  const handleApplyChanges = async () => {
    if (!selectedFile) return;
    
    const currentFile = files.find(f => f.name === selectedFile.name);
    if (!currentFile) return;

    try {
      const { url: compressedUrl, blob } = await compressImage(currentFile.file);
      
      setSelectedFile(prev => prev ? {
        ...prev,
        compressed: compressedUrl,
        compressedSize: blob.size
      } : null);

      setStatus('Changes applied successfully');
    } catch (error) {
      console.error('Error applying changes:', error);
      setStatus('Error applying changes. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Image Processor</h1>
          
          <div className="mb-6 space-y-4">
            <UploadButtons
              isLoading={isLoading}
              isFileSystemApiSupported={isFileSystemApiSupported}
              directoryHandle={directoryHandle}
              onDirectorySelect={handleSelectDirectory}
              fileInputRef={fileInputRef}
              zipInputRef={zipInputRef}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleZipUpload}
            />

            {files.length > 0 && (
              <button
                onClick={handleCompressAll}
                disabled={isCompressingAll}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isCompressingAll
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isCompressingAll ? <Loader2 className="animate-spin" size={20} /> : null}
                {isCompressingAll ? 'Compressing...' : 'Compress All'}
              </button>
            )}
          </div>

          {status && (
            <div className={`mb-4 p-3 rounded-lg ${
              status.toLowerCase().includes('error')
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {status}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <FileList
              files={files}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />

            <div className="lg:col-span-9">
              {selectedFile ? (
                <div className="space-y-6">
                  <ImagePreview
                    selectedFile={selectedFile}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isCropping={isCropping}
                    crop={crop}
                    setCrop={setCrop}
                    setCompletedCrop={setCompletedCrop}
                    imgRef={imgRef}
                    aspectRatio={aspectRatio === 'custom' ? customAspectRatio.width / customAspectRatio.height : ASPECT_RATIOS[aspectRatio]}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CompressionOptions
                      quality={quality}
                      setQuality={setQuality}
                      outputSize={outputSize}
                      setOutputSize={setOutputSize}
                      format={format}
                      setFormat={setFormat}
                    />

                    <ImageEffects
                      filter={filter}
                      setFilter={setFilter}
                      watermarkText={watermarkText}
                      setWatermarkText={setWatermarkText}
                      isCropping={isCropping}
                      setIsCropping={setIsCropping}
                      aspectRatio={aspectRatio}
                      handleAspectRatioChange={handleAspectRatioChange}
                      customAspectRatio={customAspectRatio}
                      handleCustomAspectRatioChange={handleCustomAspectRatioChange}
                      anchorPoint={anchorPoint}
                      setAnchorPoint={setAnchorPoint}
                      copyrightText={copyrightText}
                      setCopyrightText={setCopyrightText}
                      copyrightPosition={copyrightPosition}
                      setCopyrightPosition={setCopyrightPosition}
                      onRemoveCrop={handleRemoveCrop}
                      onApplyChanges={handleApplyChanges}
                    />
                  </div>

                  <DownloadButton selectedFile={selectedFile} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Select an image to begin editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;