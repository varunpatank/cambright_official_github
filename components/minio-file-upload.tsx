"use client"

import { useState, useCallback } from 'react'
import { Upload, X, File, Image, Video, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onChange: (url?: string, assetKey?: string) => void
  endpoint: 'courseImage' | 'roomImage' | 'messageFile' | 'courseAttachment' | 'noteAttachment' | 'chapterVideo' | 'schoolPostImage'
  className?: string
  disabled?: boolean
}

interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  key: string
}

const FILE_TYPE_ICONS = {
  'image/jpeg': Image,
  'image/png': Image,
  'image/webp': Image,
  'video/mp4': Video,
  'video/webm': Video,
  'video/avi': Video,
  'video/mov': Video,
  'video/quicktime': Video,
  'application/pdf': FileText,
  'text/plain': File,
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getAcceptedTypes = (endpoint: string): string => {
  const typeMap = {
    courseImage: 'image/*',
    roomImage: 'image/*',
    schoolPostImage: 'image/*',
    messageFile: 'image/*,application/pdf,text/plain',
    courseAttachment: 'image/*,video/*,application/pdf,text/plain',
    noteAttachment: 'image/*,video/*,application/pdf,text/plain',
    chapterVideo: 'video/*'
  }
  return typeMap[endpoint as keyof typeof typeMap] || '*/*'
}

export function MinioFileUpload({ 
  onChange, 
  endpoint, 
  className,
  disabled = false 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const uploadFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      // Create abort controller for timeout handling with dynamic timeout based on file size
      const controller = new AbortController()
      const fileSize = files[0]?.size || 0;
      const fileSizeGB = fileSize / (1024 * 1024 * 1024);
      
      // Dynamic timeout: 30 minutes base + 10 minutes per GB
      const timeoutMinutes = 30 + Math.ceil(fileSizeGB * 10);
      const timeoutMs = timeoutMinutes * 60 * 1000;
      
      console.log(`File size: ${fileSizeGB.toFixed(2)} GB, timeout: ${timeoutMinutes} minutes`);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Adjust progress simulation for large files
      const progressIncrement = fileSizeGB > 2 ? 2 : 10; // Slower progress for large files
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + progressIncrement, 90))
      }, fileSizeGB > 2 ? 1000 : 200) // Slower updates for large files

      const response = await fetch(`/api/minio-upload?endpoint=${endpoint}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }).catch((fetchError) => {
        console.error('Fetch error details:', fetchError);
        if (fetchError.name === 'AbortError') {
          throw new Error(`Upload timed out after ${timeoutMinutes} minutes for ${fileSizeGB.toFixed(2)}GB file. The file might be too large for your connection.`);
        }
        throw fetchError;
      });

      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        let errorData;
        let errorMessage = 'Upload failed';
        
        try {
          const responseText = await response.text();
          console.error('Upload error response text:', responseText);
          
          // Try to parse as JSON
          if (responseText.trim()) {
            errorData = JSON.parse(responseText);
            errorMessage = errorData.error || 'Upload failed';
            
            // Add more specific error details
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`;
            }
            
            // Log debug info in development
            if (process.env.NODE_ENV === 'development' && errorData.debugInfo) {
              console.error('Debug info:', errorData.debugInfo);
            }
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json().catch(async (jsonError) => {
        console.error('Failed to parse successful response as JSON:', jsonError);
        const responseText = await response.text();
        console.error('Response text:', responseText);
        throw new Error('Server returned invalid response format');
      });
      
      console.log('Upload result:', result);
      
      if (result.success && result.files && result.files.length > 0) {
        setUploadedFiles(result.files)
        // For single file uploads, call onChange with the first file URL and asset key
        onChange(result.files[0].url, result.files[0].key)
        
        // Show appropriate success message
        const fileCount = result.files.length;
        const successMessage = fileCount === 1 
          ? `File "${result.files[0].name}" uploaded successfully!`
          : `${fileCount} files uploaded successfully!`;
        toast.success(successMessage);
      } else {
        console.error('Upload result missing success or files:', result);
        throw new Error(result.error || 'Upload failed - no files returned');
      }
    } catch (error) {
      console.error('Upload error:', error)
      
      let errorMessage = 'Upload failed';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Upload timed out after 30 minutes. Please try uploading a smaller file or check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [endpoint, onChange])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled || isUploading) return
    
    const files = e.dataTransfer.files
    uploadFiles(files)
  }, [uploadFiles, disabled, isUploading])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) {
      setDragActive(true)
    }
  }, [disabled, isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      uploadFiles(files)
    }
  }, [uploadFiles])

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    if (newFiles.length === 0) {
      onChange(undefined, undefined)
    } else {
      onChange(newFiles[0].url, newFiles[0].key)
    }
  }, [uploadedFiles, onChange])

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
          isUploading && "pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && document.getElementById(`file-input-${endpoint}`)?.click()}
      >
        <input
          id={`file-input-${endpoint}`}
          type="file"
          accept={getAcceptedTypes(endpoint)}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
          multiple={endpoint === 'messageFile'}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={cn(
            "w-10 h-10 mb-4",
            dragActive ? "text-primary" : "text-gray-400"
          )} />
          
          {isUploading ? (
            <div className="w-full space-y-2">
              <p className="text-sm text-gray-600">Uploading...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Drop files here or <span className="text-primary font-medium">click to upload</span>
              </p>
              <p className="text-xs text-gray-500">
                {endpoint === 'courseImage' || endpoint === 'roomImage' || endpoint === 'schoolPostImage' 
                  ? 'Images up to 4MB' 
                  : endpoint === 'chapterVideo' 
                  ? 'Videos up to 10GB'
                  : 'Files up to 512MB'
                }
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => {
            const IconComponent = FILE_TYPE_ICONS[file.type as keyof typeof FILE_TYPE_ICONS] || File
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 