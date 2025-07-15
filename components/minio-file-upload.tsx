"use client"

import { useState, useCallback } from 'react'
import { Upload, X, File, Image, Video, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onChange: (url?: string) => void
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

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/minio-upload?endpoint=${endpoint}`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      if (result.success && result.files.length > 0) {
        setUploadedFiles(result.files)
        // For single file uploads, call onChange with the first file URL
        onChange(result.files[0].url)
        toast.success('Files uploaded successfully!')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
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
      onChange(undefined)
    } else {
      onChange(newFiles[0].url)
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
                  ? 'Videos up to 512GB'
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