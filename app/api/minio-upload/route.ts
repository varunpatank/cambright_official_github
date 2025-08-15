import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isTutor } from '@/lib/tutor'
import { uploadFile, BUCKET_NAME } from '@/lib/minio'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import { db } from '@/lib/db'

// Configure route for large file uploads
export const runtime = 'nodejs'
export const maxDuration = 1800; // 30 minutes for large files
export const dynamic = 'force-dynamic';

// Additional configuration for large file handling
export const preferredRegion = 'auto';
export const revalidate = false;

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
    accept: ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo'], 
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
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
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
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
  console.log('MinIO upload started');
  
  let userId: string | null = null;
  let endpoint: string | null = null;
  
  try {
    const auth_result = auth()
    userId = auth_result.userId
    
    if (!userId) {
      console.log('Upload failed: No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    endpoint = url.searchParams.get('endpoint')
    
    console.log(`Upload request for endpoint: ${endpoint}`);
    
    if (!endpoint || !FILE_TYPES[endpoint as keyof typeof FILE_TYPES]) {
      console.log(`Upload failed: Invalid endpoint ${endpoint}`);
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }

    const fileConfig = FILE_TYPES[endpoint as keyof typeof FILE_TYPES]

    // Note: Removed tutor restrictions - all authenticated users can now upload files

    // Log content length for debugging
    const contentLength = request.headers.get('content-length');
    console.log(`Request content length: ${contentLength} bytes`);
    
    if (contentLength) {
      const sizeInGB = parseInt(contentLength) / (1024 * 1024 * 1024);
      console.log(`Request size: ${sizeInGB.toFixed(2)} GB`);
      
      // 10GB limit
      const maxBodySize = 10 * 1024 * 1024 * 1024;
      if (parseInt(contentLength) > maxBodySize) {
        console.error(`Request size (${sizeInGB.toFixed(2)} GB) exceeds limit (${(maxBodySize / (1024 * 1024 * 1024))} GB)`);
        return NextResponse.json({ 
          error: `File too large: ${sizeInGB.toFixed(2)} GB. Maximum allowed: ${(maxBodySize / (1024 * 1024 * 1024))} GB`,
          details: 'The file exceeds the server upload limit'
        }, { status: 413 })
      }
    }

    console.log('Attempting to parse FormData...');
    
    // Try using a different approach for large files
    let formData: FormData;
    try {
      // Set a longer timeout for FormData parsing
      const parsePromise = request.formData();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('FormData parsing timeout after 10 minutes')), 10 * 60 * 1000)
      );
      
      formData = await Promise.race([parsePromise, timeoutPromise]) as FormData;
      console.log('FormData parsed successfully');
    } catch (parseError: any) {
      console.error('FormData parsing error:', parseError);
      
      // Check if it's a size limit error
      if (parseError.message?.includes('size') || parseError.message?.includes('limit') || parseError.message?.includes('payload')) {
        return NextResponse.json({ 
          error: 'File too large for FormData parsing',
          details: `The uploaded file exceeds the maximum size limit. Error: ${parseError.message}`,
          suggestion: 'Try uploading a smaller file or contact support for large file uploads.'
        }, { status: 413 })
      }
      
      throw new Error(`Failed to parse form data: ${parseError.message}. This often happens with files larger than the server limit.`);
    }
    
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > fileConfig.maxCount) {
      return NextResponse.json({ 
        error: `Too many files. Maximum ${fileConfig.maxCount} allowed` 
      }, { status: 400 })
    }

    console.log('Processing files for upload:', files.length);

    const uploadResults: any[] = [];

    for (const file of files) {
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      // Validate file type
      if (!fileConfig.accept.includes(file.type)) {
        console.log(`File type validation failed for ${file.name}: ${file.type}`);
        return NextResponse.json({ 
          error: `Invalid file type: ${file.type}. Allowed types: ${fileConfig.accept.join(', ')}` 
        }, { status: 400 })
      }

      // Validate file size
      if (file.size > fileConfig.maxSize) {
        console.log(`File size validation failed for ${file.name}: ${file.size} bytes`);
        return NextResponse.json({ 
          error: `File too large: ${file.size} bytes. Maximum size: ${fileConfig.maxSize} bytes` 
        }, { status: 400 })
      }

      // Generate random 32-character hex key
      const randomKey = crypto.randomBytes(16).toString('hex') // 32 hex chars
      const fileExtension = getFileExtension(file.type)
      const folderPath = getFolderPath(endpoint)
      const objectName = `${folderPath}${randomKey}${fileExtension}`

      console.log(`Generated object name: ${objectName}`);

      // Convert file to buffer
      console.log(`Converting file to buffer for ${file.name}...`);
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log(`File converted to buffer: ${buffer.length} bytes`);
      
      // Validate buffer is not empty
      if (buffer.length === 0) {
        console.log(`Buffer is empty for file ${file.name}`);
        return NextResponse.json({ 
          error: `File ${file.name} appears to be empty or could not be read` 
        }, { status: 400 })
      }
      
      // Always use 'cambright' bucket for courseImage, courseAttachment, chapterVideo
      const cambrightEndpoints = ['courseImage', 'courseAttachment', 'chapterVideo']
      const bucketToUse = cambrightEndpoints.includes(endpoint) ? 'cambright' : BUCKET_NAME

      console.log(`Uploading to bucket: ${bucketToUse}`);

        // Upload to MinIO with proper metadata
        try {
          const metadata: Record<string, string> = {
            'Content-Type': file.type,
            'Original-Name': encodeURIComponent(file.name), // Encode special characters
            'Uploaded-By': userId,
            'Upload-Timestamp': new Date().toISOString(),
            'Endpoint': endpoint,
            'File-Size': file.size.toString()
          };

          console.log(`Upload metadata:`, metadata);

          let result;
          
          // Use standard upload for all files - videos don't need special handling
          result = await uploadFile(bucketToUse, objectName, buffer, metadata);

          console.log('MinIO upload successful:', result);

        // Create Asset record in database for assets that need database records
        const endpointsNeedingDBRecord = ['chapterVideo', 'schoolImage', 'schoolBanner', 'postImage', 'courseImage']
        if (endpointsNeedingDBRecord.includes(endpoint)) {
          try {
            // Map endpoint to asset type
            const assetTypeMap: Record<string, string> = {
              'chapterVideo': 'CHAPTER_VIDEO',
              'schoolImage': 'SCHOOL_IMAGE',
              'schoolBanner': 'SCHOOL_BANNER',
              'postImage': 'POST_IMAGE',
              'courseImage': 'COURSE_IMAGE'
            }
            
            const assetType = assetTypeMap[endpoint] || 'GENERAL_FILE'
            
            const asset = await db.assets.create({
              data: {
                id: randomKey, // Use the random key as the asset ID
                key: randomKey,
                originalName: file.name,
                mimeType: file.type,
                size: file.size,
                url: result.url,
                type: assetType, // Use the mapped asset type
                uploadedBy: userId,
                isActive: true
              }
            });
            console.log('Asset record created:', asset.id);
          } catch (dbError: any) {
            console.error('Failed to create asset record:', dbError);
            // Return error if database insert fails
            return NextResponse.json({ 
              error: `Upload succeeded but failed to create database record: ${dbError.message}`,
              details: 'File uploaded to MinIO but database record creation failed'
            }, { status: 500 })
          }
        }

        uploadResults.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: result.url,
          key: randomKey, // Use the generated key as the asset key
          assetKey: randomKey // Also provide assetKey for backward compatibility
        })
    } catch (uploadError: any) {
      console.error(`Upload failed for ${file.name}:`, uploadError);
      
      // Provide more specific error messages
      let errorMessage = `Upload failed for ${file.name}`;
      let errorDetails = uploadError.message;
      
      if (uploadError.message?.includes('timeout')) {
        errorMessage = `Upload timeout for ${file.name}`;
        errorDetails = 'File upload took too long. Try uploading a smaller file or check your connection.';
      } else if (uploadError.message?.includes('ECONNREFUSED')) {
        errorMessage = `Connection failed for ${file.name}`;
        errorDetails = 'Cannot connect to MinIO server. Please check if MinIO is running.';
      } else if (uploadError.message?.includes('NoSuchBucket')) {
        errorMessage = `Storage error for ${file.name}`;
        errorDetails = 'MinIO bucket does not exist and could not be created.';
      } else if (uploadError.message?.includes('AccessDenied')) {
        errorMessage = `Permission denied for ${file.name}`;
        errorDetails = 'Access denied to MinIO storage. Check credentials and permissions.';
      }
      
      return NextResponse.json({ 
        error: errorMessage, 
        details: errorDetails,
        debugInfo: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          objectName,
          bucketToUse,
          errorType: uploadError.constructor.name,
          step: 'MinIO upload'
        }
      }, { status: 500 })
    }
    }

    console.log('All uploads completed successfully:', uploadResults);

    const response = { 
      success: true, 
      files: uploadResults 
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response)

  } catch (error) {
    console.error('MinIO upload error:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Upload failed'
    let errorDetails = error instanceof Error ? error.message : String(error)
    
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('Failed to parse form data')) {
        errorMessage = 'File too large for upload'
        errorDetails = 'The file you\'re trying to upload is larger than the server can handle. Please try a smaller file or contact support for large file uploads.'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to MinIO server'
        errorDetails = 'MinIO server is not accessible. Please check if MinIO is running.'
      } else if (error.message.includes('credentials')) {
        errorMessage = 'MinIO authentication failed'
        errorDetails = 'Invalid MinIO credentials. Please check your access keys.'
      } else if (error.message.includes('bucket')) {
        errorMessage = 'MinIO bucket error'
        errorDetails = 'Could not access or create the required bucket.'
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage, 
      details: errorDetails,
      debug: process.env.NODE_ENV === 'development' ? {
        endpoint,
        userId,
        minioUrl: process.env.MINIO_URL,
        hasCredentials: !!(process.env.MINIO_KEY_ID && process.env.MINIO_ACCESS_KEY)
      } : undefined
    }, { status: 500 })
  }
} 