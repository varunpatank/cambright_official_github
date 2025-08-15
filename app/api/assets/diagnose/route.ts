import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { minioClient, BUCKET_NAME } from '@/lib/minio'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Testing MinIO connection...')
    
    // Test 1: Check if MinIO client is configured
    const minioConfig = {
      hasMINIO_URL: !!process.env.MINIO_URL,
      hasMINIO_KEY_ID: !!process.env.MINIO_KEY_ID,
      hasMINIO_ACCESS_KEY: !!process.env.MINIO_ACCESS_KEY,
      bucketName: BUCKET_NAME
    }
    
    console.log('MinIO config check:', minioConfig)

    // Test 2: Check if bucket exists
    let bucketExists = false
    try {
      bucketExists = await minioClient.bucketExists(BUCKET_NAME)
      console.log(`Bucket ${BUCKET_NAME} exists:`, bucketExists)
    } catch (bucketError) {
      console.error('Bucket check error:', bucketError)
    }

    // Test 3: Try to list objects (just to test connection)
    let canConnect = false
    try {
      const objectsStream = minioClient.listObjects(BUCKET_NAME, '', true)
      let objectCount = 0
      
      // Don't list all objects, just test connection
      for await (const obj of objectsStream) {
        objectCount++
        if (objectCount >= 1) break // Just test that we can connect
      }
      
      canConnect = true
      console.log('MinIO connection test successful')
    } catch (connectionError) {
      console.error('MinIO connection test failed:', connectionError)
    }

    // Test 4: Database connection
    let dbConnected = false
    try {
      const { db } = await import('@/lib/db')
      await db.$queryRaw`SELECT 1`
      dbConnected = true
      console.log('Database connection test successful')
    } catch (dbError) {
      console.error('Database connection test failed:', dbError)
    }

    return NextResponse.json({
      status: 'MinIO Diagnostic Complete',
      tests: {
        minioConfig,
        bucketExists,
        canConnect,
        dbConnected
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
