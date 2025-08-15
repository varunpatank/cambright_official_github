import { NextRequest, NextResponse } from 'next/server'
import { AssetType } from '@prisma/client'
import { assetManager } from '@/lib/asset-manager'
import { auth } from '@clerk/nextjs/server'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed MIME types for different asset types
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'SCHOOL_IMAGE': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  'SCHOOL_BANNER': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  'POST_IMAGE': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  'COURSE_IMAGE': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  'GENERAL_FILE': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Clerk
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const assetTypeStr = formData.get('assetType') as string

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    if (!assetTypeStr) {
      return NextResponse.json(
        { error: 'Asset type is required' },
        { status: 400 }
      )
    }

    // Validate asset type
    const validAssetTypes = ['SCHOOL_IMAGE', 'SCHOOL_BANNER', 'POST_IMAGE', 'COURSE_IMAGE', 'GENERAL_FILE']
    if (!validAssetTypes.includes(assetTypeStr)) {
      return NextResponse.json(
        { error: `Invalid asset type. Valid types: ${validAssetTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const assetType = assetTypeStr as AssetType

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Validate MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[assetType]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file name
    if (!file.name || file.name.length > 255) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      )
    }

    // Additional security checks
    const fileName = file.name.toLowerCase()
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.jar']
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      return NextResponse.json(
        { error: 'File type not allowed for security reasons' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Upload asset using AssetManager
    console.log('About to upload asset with AssetManager...', {
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      assetType,
      userId
    })
    
    const assetRecord = await assetManager.uploadAsset({
      file: fileBuffer,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      assetType,
      uploadedBy: userId
    })
    
    console.log('AssetManager returned:', assetRecord)

    // Return success response with asset key and API URL
    return NextResponse.json({
      success: true,
      asset: {
        key: assetRecord.key,
        url: assetRecord.url,
        fileName: assetRecord.fileName,
        mimeType: assetRecord.mimeType,
        fileSize: assetRecord.fileSize
      }
    })

  } catch (error) {
    console.error('Asset upload error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('Failed to upload')) {
        return NextResponse.json(
          { error: `Failed to upload asset: ${error.message}` },
          { status: 500 }
        )
      }
      
      // Check for specific error types
      if (error.message.includes('MINIO')) {
        return NextResponse.json(
          { error: 'Storage service unavailable. Please try again later.' },
          { status: 503 }
        )
      }
      
      if (error.message.includes('File size exceeds')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Invalid file type')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      // Return the actual error message for debugging
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}