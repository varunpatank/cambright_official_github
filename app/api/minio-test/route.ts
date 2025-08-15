import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { minioClient, BUCKET_NAME } from '@/lib/minio'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test MinIO connection and configuration
    const results = {
      timestamp: new Date().toISOString(),
      userId,
      environment: {
        minioUrl: process.env.MINIO_URL || 'NOT_SET',
        hasAccessKey: !!process.env.MINIO_KEY_ID,
        hasSecretKey: !!process.env.MINIO_ACCESS_KEY,
        bucketName: BUCKET_NAME
      },
      tests: {} as any
    }

    try {
      // Test 1: Check if bucket exists
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
      results.tests.bucketExists = {
        success: true,
        result: bucketExists,
        message: bucketExists ? 'Bucket exists' : 'Bucket does not exist'
      }
    } catch (error) {
      results.tests.bucketExists = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    try {
      // Test 2: Try to list objects (basic connectivity)
      const objects = []
      const stream = minioClient.listObjects(BUCKET_NAME, '', false)
      
      await new Promise((resolve, reject) => {
        let objectCount = 0
        stream.on('data', (obj) => {
          objectCount++
          if (objectCount <= 5) { // Only collect first 5 objects
            objects.push(obj.name)
          }
        })
        stream.on('end', () => resolve(objectCount))
        stream.on('error', reject)
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout')), 5000)
      })
      
      results.tests.listObjects = {
        success: true,
        sampleObjects: objects,
        message: `Successfully connected to MinIO`
      }
    } catch (error) {
      results.tests.listObjects = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
