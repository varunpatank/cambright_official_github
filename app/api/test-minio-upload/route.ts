import { NextRequest, NextResponse } from 'next/server'
import { minioClient } from '@/lib/minio'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing MinIO video upload capabilities...');
    
    // Test 1: Small file upload
    console.log('Test 1: Small file upload');
    const smallTestData = Buffer.from('test video data', 'utf8');
    const smallObjectName = `test-uploads/test-small-${Date.now()}.txt`;
    
    await minioClient.putObject('cambright', smallObjectName, smallTestData, smallTestData.length, {
      'Content-Type': 'text/plain'
    });
    console.log('✅ Small file upload successful');
    
    // Test 2: Video-like metadata
    console.log('Test 2: Video metadata test');
    const videoTestData = Buffer.from('fake video content for testing', 'utf8');
    const videoObjectName = `test-uploads/test-video-${Date.now()}.mp4`;
    
    await minioClient.putObject('cambright', videoObjectName, videoTestData, videoTestData.length, {
      'Content-Type': 'video/mp4',
      'Original-Name': 'test-video.mp4',
      'Content-Disposition': 'attachment; filename="test-video.mp4"'
    });
    console.log('✅ Video metadata test successful');
    
    // Test 3: Larger buffer (1MB)
    console.log('Test 3: Larger buffer test');
    const largeTestData = Buffer.alloc(1024 * 1024, 'x'); // 1MB of 'x'
    const largeObjectName = `test-uploads/test-large-${Date.now()}.bin`;
    
    await minioClient.putObject('cambright', largeObjectName, largeTestData, largeTestData.length, {
      'Content-Type': 'application/octet-stream'
    });
    console.log('✅ Large buffer test successful');
    
    // Clean up test files
    console.log('Cleaning up test files...');
    await minioClient.removeObject('cambright', smallObjectName);
    await minioClient.removeObject('cambright', videoObjectName);
    await minioClient.removeObject('cambright', largeObjectName);
    console.log('✅ Cleanup successful');
    
    return NextResponse.json({
      status: 'success',
      message: 'All MinIO upload tests passed',
      tests: ['small file', 'video metadata', 'large buffer'],
      conclusion: 'MinIO upload functionality is working correctly'
    })
    
  } catch (error: any) {
    console.error('MinIO test failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      details: {
        errorCode: error.errorCode,
        requestId: error.requestId,
        resource: error.resource,
        region: error.region
      }
    }, { status: 500 })
  }
}
