import { NextRequest, NextResponse } from 'next/server'
import { minioClient, BUCKET_NAME } from '@/lib/minio'

export async function GET(request: NextRequest) {
  try {
    console.log('Checking MinIO status...');
    
    // Check if we can connect to MinIO
    const bucketExists = await minioClient.bucketExists('cambright');
    console.log('Cambright bucket exists:', bucketExists);
    
    // Try to list objects to verify read permissions
    const objects: any[] = []
    const stream = minioClient.listObjects('cambright', 'uploads/chapters/videos/', false)
    
    const listPromise = new Promise((resolve, reject) => {
      stream.on('data', (obj) => objects.push(obj))
      stream.on('end', () => resolve(objects))
      stream.on('error', reject)
    })
    
    await listPromise;
    
    return NextResponse.json({
      status: 'connected',
      bucketExists,
      objectCount: objects.length,
      minioUrl: process.env.MINIO_URL,
      hasCredentials: !!(process.env.MINIO_KEY_ID && process.env.MINIO_ACCESS_KEY)
    })
    
  } catch (error: any) {
    console.error('MinIO status check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    }, { status: 500 })
  }
}
