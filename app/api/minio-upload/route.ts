import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isTutor } from '@/lib/tutor'
import { uploadFile, BUCKET_NAME } from '@/lib/minio'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

// Supported file types and size limits
const FILE_TYPES = {
  courseImage: { 
    accept: ['image/jpeg', 'image/png', 'image/webp'], 
    maxSize: 4 * 1024 * 1024, // 4MB
    maxCount: 1 
  },
  roomImage: { 
    accept: ['image/jpeg', 'image/png', 'image/webp'], 
    maxSize: 4 * 1024 * 1024, // 4MB
    maxCount: 1 
  },
  messageFile: { 
    accept: ['text/plain', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 
    maxSize: 512 * 1024 * 1024, // 512MB
    maxCount: 500 
  },
  courseAttachment: { 
    accept: ['text/plain', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'], 
    maxSize: 512 * 1024 * 1024, // 512MB
    maxCount: 1 
  },
  noteAttachment: { 
    accept: ['text/plain', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'], 
    maxSize: 512 * 1024 * 1024, // 512MB
    maxCount: 1 
  },
  chapterVideo: { 
    accept: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'], 
    maxSize: 512 * 1024 * 1024 * 1024, // 512GB
    maxCount: 1 
  },
  schoolPostImage: { 
    accept: ['image/jpeg', 'image/png', 'image/webp'], 
    maxSize: 4 * 1024 * 1024, // 4MB
    maxCount: 1 
  }
}

// Get file extension from MIME type
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/avi': '.avi',
    'video/mov': '.mov',
    'application/pdf': '.pdf',
    'text/plain': '.txt'
  }
  return extensions[mimeType] || ''
}

// Generate folder path based on endpoint
function getFolderPath(endpoint: string): string {
  const folders: Record<string, string> = {
    courseImage: 'uploads/courses/images/',
    roomImage: 'uploads/rooms/images/',
    messageFile: 'uploads/messages/',
    courseAttachment: 'uploads/courses/attachments/',
    noteAttachment: 'uploads/notes/attachments/',
    chapterVideo: 'uploads/chapters/videos/',
    schoolPostImage: 'uploads/schools/posts/'
  }
  return folders[endpoint] || 'uploads/misc/'
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const endpoint = url.searchParams.get('endpoint')
    
    if (!endpoint || !FILE_TYPES[endpoint as keyof typeof FILE_TYPES]) {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }

    const fileConfig = FILE_TYPES[endpoint as keyof typeof FILE_TYPES]

    // Check authorization for tutor-only endpoints
    const tutorOnlyEndpoints = ['courseAttachment', 'noteAttachment', 'chapterVideo']
    if (tutorOnlyEndpoints.includes(endpoint)) {
      const isAuthorized = await isTutor(userId)
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Tutor access required' }, { status: 403 })
      }
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > fileConfig.maxCount) {
      return NextResponse.json({ 
        error: `Too many files. Maximum ${fileConfig.maxCount} allowed` 
      }, { status: 400 })
    }

    const uploadResults = []

    for (const file of files) {
      // Validate file type
      if (!fileConfig.accept.includes(file.type)) {
        return NextResponse.json({ 
          error: `Invalid file type: ${file.type}. Allowed types: ${fileConfig.accept.join(', ')}` 
        }, { status: 400 })
      }

      // Validate file size
      if (file.size > fileConfig.maxSize) {
        return NextResponse.json({ 
          error: `File too large: ${file.size} bytes. Maximum size: ${fileConfig.maxSize} bytes` 
        }, { status: 400 })
      }

      // Generate random 32-character hex key
      const randomKey = crypto.randomBytes(16).toString('hex') // 32 hex chars
      const fileExtension = getFileExtension(file.type)
      const folderPath = getFolderPath(endpoint)
      const objectName = `${folderPath}${randomKey}${fileExtension}`

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Always use 'cambright' bucket for courseImage, courseAttachment, chapterVideo
      const cambrightEndpoints = ['courseImage', 'courseAttachment', 'chapterVideo']
      const bucketToUse = cambrightEndpoints.includes(endpoint) ? 'cambright' : BUCKET_NAME

      // Upload to MinIO
      const result = await uploadFile(bucketToUse, objectName, buffer, {
        'Content-Type': file.type,
        'Original-Name': file.name,
        'Uploaded-By': userId,
        'Upload-Timestamp': new Date().toISOString(),
        'Endpoint': endpoint
      })

      uploadResults.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: result.url,
        key: objectName
      })
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadResults 
    })

  } catch (error) {
    console.error('MinIO upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 