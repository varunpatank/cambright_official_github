"use client"

import { MinioFileUpload } from './minio-file-upload'

interface FileUploadProps {
  onChange: (url?: string) => void
  endpoint: 'courseImage' | 'roomImage' | 'messageFile' | 'courseAttachment' | 'noteAttachment' | 'chapterVideo' | 'schoolPostImage'
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return (
    <MinioFileUpload
      onChange={onChange}
      endpoint={endpoint}
      className="ut-label:text-purple-600 ut-allowed-content:text-purple-300 ut-button:bg-purple-600"
    />
  )
} 