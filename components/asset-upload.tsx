"use client"

import { useState, useCallback } from 'react'
import { Upload, X, File, Image, Video, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AssetUploadProps {
  onChange: (assetKey?: string) => void
  assetType: 'SCHOOL_IMAGE' | 'SCHOOL_BANNER' | 'POST_IMAGE' | 'COURSE_IMAGE' | 'CHAPTER_VIDEO' | 'NOTE_ATTACHMENT'
  className?: string
  disabled?: boolean
  accept?: string
  maxSize?: number
}

interface UploadedAsset {
  key: string
  fileName: string
  mimeType: string
  fileSize: number
  url: string
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

const getDefaultAccept = (assetType: string): string => {
  const typeMap = {
    SCHOOL_IMAGE: 'image/*',
    SCHOOL_BANNER: 'image/*',
    POST_IMAGE: 'image/*',
    COURSE_IMAGE: 'image/*',
    CHAPTER_VIDEO: 'video/*',
    NOTE_ATTACHMENT: 'image/*,video/*,application/pdf,text/plain'
  }
  return typeMap[assetType as keyof typeof typeMap] || '*/*'
}

const getDefaultMaxSize = (assetType: string): number => {
  const sizeMap = {
    SCHOOL_IMAGE: 4 * 1024 * 1024, // 4MB
    SCHOOL_BANNER: 4 * 1024 * 1024, // 4MB
    POST_IMAGE: 4 * 1024 * 1024, // 4MB
    COURSE_IMAGE: 4 * 1024 * 1024, // 4MB
    CHAPTER_VIDEO: 512 * 1024 * 1024, // 512MB
    NOTE_ATTACHMENT: 512 * 1024 * 1024 // 512MB
  }
  return sizeMap[assetType as keyof typeof sizeMap] || 4 * 1024 * 1024
}

export function AssetUpload({ 
  onChange, 
  assetType,
  className,
  disabled = false,
  accept,
  maxSize
}: AssetUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null)

  const acceptTypes = accept || getDefaultAccept(assetType)
  const maxFileSize = maxSize || getDefaultMaxSize(assetType)

  const uploadFile = useCallback(async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File too large. Maximum size: ${formatFileSize(maxFileSize)}`)
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('assetType', assetType)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/assets/upload', {
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
      
      if (result.key) {
        const asset: UploadedAsset = {
          key: result.key,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          url: result.url
        }
        setUploadedAsset(asset)
        onChange(result.key)
        toast.success('File uploaded successfully!')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [assetType, maxFileSize, onChange])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled || isUploading) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }, [uploadFile, disabled, isUploading])

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
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }, [uploadFile])

  const removeAsset = useCallback(() => {
    setUploadedAsset(null)
    onChange(undefined)
  }, [onChange])

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
        onClick={() => !disabled && !isUploading && document.getElementById(`asset-input-${assetType}`)?.click()}
      >
        <input
          id={`asset-input-${assetType}`}
          type="file"
          accept={acceptTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
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
                Drop file here or <span className="text-primary font-medium">click to upload</span>
              </p>
              <p className="text-xs text-gray-500">
                {assetType.includes('IMAGE') 
                  ? `Images up to ${formatFileSize(maxFileSize)}` 
                  : assetType === 'CHAPTER_VIDEO' 
                  ? `Videos up to ${formatFileSize(maxFileSize)}`
                  : `Files up to ${formatFileSize(maxFileSize)}`
                }
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Asset Display */}
      {uploadedAsset && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded File:</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {(() => {
                const IconComponent = FILE_TYPE_ICONS[uploadedAsset.mimeType as keyof typeof FILE_TYPE_ICONS] || File
                return <IconComponent className="w-5 h-5 text-gray-500" />
              })()}
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedAsset.fileName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedAsset.fileSize)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                removeAsset()
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}