import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { uploadFile, BUCKET_NAME } from '@/lib/minio'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'

// Configure route for large video uploads
export const runtime = 'nodejs'
export const maxDuration = 1800; // 30 minutes for large videos
export const dynamic = 'force-dynamic';

// Video specific configuration
const VIDEO_TYPES = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogg',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi'
};

export async function POST(request: NextRequest) {
  console.log('Video upload started with streaming approach');
  
  try {
    const auth_result = auth()
    const userId = auth_result.userId
    
    if (!userId) {
      console.log('Video upload failed: No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get headers for file info
    const contentType = request.headers.get('content-type') || '';
    const contentLength = request.headers.get('content-length');
    const filename = request.headers.get('x-filename') || `video-${nanoid()}.mp4`;
    
    console.log(`Video upload - Type: ${contentType}, Length: ${contentLength}, Filename: ${filename}`);
    
    // Validate content type
    if (!Object.keys(VIDEO_TYPES).some(type => contentType.includes(type))) {
      return NextResponse.json({ 
        error: 'Invalid video format',
        details: 'Supported formats: MP4, WebM, OGG, MOV, AVI'
      }, { status: 400 })
    }

    // Check file size (10GB limit)
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
      
      if (sizeInBytes > maxSize) {
        const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
        return NextResponse.json({ 
          error: `Video too large: ${sizeInGB.toFixed(2)} GB. Maximum allowed: 10 GB`
        }, { status: 413 })
      }
    }

    // Generate unique key for video
    const fileExtension = Object.entries(VIDEO_TYPES).find(([type]) => 
      contentType.includes(type)
    )?.[1] || '.mp4';
    
    const videoKey = `uploads/chapters/videos/${nanoid()}${fileExtension}`;
    
    console.log(`Uploading video to MinIO with key: ${videoKey}`);
    
    // Stream the request body directly to MinIO
    const body = request.body;
    if (!body) {
      return NextResponse.json({ error: 'No video data received' }, { status: 400 });
    }

    console.log('Reading video data from request body...');
    
    // Convert the ReadableStream to buffer more efficiently
    let videoBuffer: Buffer;
    try {
      const chunks: Uint8Array[] = [];
      const reader = body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine all chunks into a single buffer
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      videoBuffer = Buffer.allocUnsafe(totalLength);
      
      let offset = 0;
      for (const chunk of chunks) {
        videoBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      
      console.log(`Video buffer created: ${videoBuffer.length} bytes`);
    } catch (streamError: any) {
      console.error('Error reading video stream:', streamError);
      return NextResponse.json({ 
        error: 'Failed to read video data',
        details: streamError.message
      }, { status: 400 });
    }

    console.log(`Uploading video to MinIO: ${videoKey} (${videoBuffer.length} bytes)`);

    // Upload to MinIO using the correct function signature
    const uploadResult = await uploadFile(
      BUCKET_NAME,
      videoKey,
      videoBuffer,
      {
        'Content-Type': contentType || 'video/mp4',
        'X-Original-Name': filename,
        'X-Uploaded-By': userId,
        'X-Uploaded-At': new Date().toISOString(),
        'X-Endpoint': 'chapterVideo'
      }
    );

    console.log('Video uploaded successfully to MinIO:', uploadResult);

    // Return the video key for use in chapter creation
    return NextResponse.json({
      success: true,
      videoKey: videoKey,
      url: uploadResult.url,
      size: contentLength ? parseInt(contentLength) : undefined,
      filename: filename,
      message: 'Video uploaded successfully'
    });

  } catch (error: any) {
    console.error('Video upload error:', error);
    
    if (error.message?.includes('size') || error.message?.includes('limit')) {
      return NextResponse.json({ 
        error: 'Video file too large',
        details: error.message,
        suggestion: 'Try compressing the video or uploading a smaller file.'
      }, { status: 413 })
    }
    
    return NextResponse.json({ 
      error: 'Video upload failed',
      details: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
