import React, { useState, useRef } from 'react';
import { Upload, X, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoUploadProps {
  onUploadComplete: (videoKey: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeGB?: number;
  className?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxSizeGB = 10,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (!supportedFormats.includes(file.type)) {
      return `Unsupported video format. Supported formats: MP4, WebM, OGG, MOV, AVI`;
    }
    
    if (file.size > maxSizeBytes) {
      const sizeInGB = file.size / (1024 * 1024 * 1024);
      return `Video too large: ${sizeInGB.toFixed(2)} GB. Maximum allowed: ${maxSizeGB} GB`;
    }
    
    return null;
  };

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      console.log(`Starting video upload: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
      
      // Use streaming upload approach
      const response = await fetch('/api/video-upload', {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size.toString(),
          'X-Filename': file.name,
        },
        body: file,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('Video upload successful:', result);
      
      setSuccess(`Video "${file.name}" uploaded successfully!`);
      onUploadComplete(result.videoKey);
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error('Video upload error:', error);
      
      if (error.name === 'AbortError') {
        setError('Upload cancelled');
      } else {
        const errorMessage = error.message || 'Video upload failed';
        setError(errorMessage);
        onUploadError?.(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <Video className="w-12 h-12 text-gray-400" />
          
          <div>
            <h3 className="text-lg font-medium">Upload Video</h3>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop a video file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supported: MP4, WebM, OGG, MOV, AVI (Max: {maxSizeGB} GB)
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Video
          </Button>
        </div>
      </div>

      {/* Selected File */}
      {selectedFile && !isUploading && (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => uploadVideo(selectedFile)}
              disabled={isUploading}
            >
              Upload
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading video...</span>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelUpload}
            >
              Cancel
            </Button>
          </div>
          
          {uploadProgress && (
            <>
              <Progress value={uploadProgress.percentage} className="w-full" />
              <p className="text-xs text-gray-500 text-center">
                {uploadProgress.percentage.toFixed(1)}% - {(uploadProgress.loaded / (1024 * 1024)).toFixed(2)} MB of {(uploadProgress.total / (1024 * 1024)).toFixed(2)} MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
